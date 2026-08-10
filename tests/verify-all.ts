import { prisma } from '../src/lib/prisma';
import { ChallengeAssignmentService } from '../src/lib/services/assignment';
import { ChallengeSessionService } from '../src/lib/services/session';
import { SessionStatus } from '@prisma/client';

async function runTests() {
  console.log('🧪 Running 30s Challenge Verification & Security Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      failed++;
    }
  }

  try {
    // 1. Fetch test users
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      take: 10,
    });

    assert(users.length >= 10, 'Found at least 10 test users in database');

    const testDateStr = '2026-08-15'; // Dedicated test date string

    // Clean any prior test assignments for testDateStr
    await prisma.submission.deleteMany({
      where: { session: { assignment: { assignedDate: testDateStr } } },
    });
    await prisma.challengeSession.deleteMany({
      where: { assignment: { assignedDate: testDateStr } },
    });
    await prisma.challengeAssignment.deleteMany({
      where: { assignedDate: testDateStr },
    });

    // ----------------------------------------------------
    // TEST 1: 10 Users receive 10 distinct challenges on same day
    // ----------------------------------------------------
    console.log('\n--- Test 1: Daily Assignment Uniqueness Across 10 Users ---');
    const assignedChallengeIds = new Set<string>();
    const assignmentsMap = new Map<string, string>();

    for (const u of users) {
      const res = await ChallengeAssignmentService.getOrAssignDailyChallenge(u.id, testDateStr);
      assert(res.status === 'SUCCESS' && !!res.assignment, `User ${u.username} assigned challenge successfully`);
      if (res.assignment) {
        assignedChallengeIds.add(res.assignment.challengeId);
        assignmentsMap.set(u.id, res.assignment.id);
      }
    }

    assert(
      assignedChallengeIds.size === users.length,
      `All ${users.length} users received UNIQUE challenges on the same day (${assignedChallengeIds.size} unique IDs)`
    );

    // ----------------------------------------------------
    // TEST 2: Idempotency (Page Refresh Simulation)
    // ----------------------------------------------------
    console.log('\n--- Test 2: Idempotency (Page Refresh Simulation) ---');
    const firstUser = users[0];
    const originalAssignmentId = assignmentsMap.get(firstUser.id);

    // Request assignment 5 times
    let isIdempotent = true;
    for (let i = 0; i < 5; i++) {
      const res = await ChallengeAssignmentService.getOrAssignDailyChallenge(firstUser.id, testDateStr);
      if (res.assignment?.id !== originalAssignmentId) {
        isIdempotent = false;
      }
    }
    assert(isIdempotent, 'User calling assignment service 5 times receives exact same assignment ID');

    // ----------------------------------------------------
    // TEST 3: No Challenge Repeat for Same User Across Days
    // ----------------------------------------------------
    console.log('\n--- Test 3: No Repeats Across Days ---');
    const day2Str = '2026-08-16';
    const day1ChallengeId = (await prisma.challengeAssignment.findUnique({
      where: { id: originalAssignmentId! },
    }))?.challengeId;

    const day2Res = await ChallengeAssignmentService.getOrAssignDailyChallenge(firstUser.id, day2Str);
    assert(
      day2Res.assignment?.challengeId !== day1ChallengeId,
      `User ${firstUser.username} received different challenge on Day 2 than Day 1`
    );

    // Clean day2 test
    await prisma.challengeAssignment.deleteMany({ where: { assignedDate: day2Str } });

    // ----------------------------------------------------
    // TEST 4: Server-Authoritative 30-Second Timer Execution
    // ----------------------------------------------------
    console.log('\n--- Test 4: Server-Authoritative 30s Timer ---');
    const user2 = users[1];
    const user2AssignmentId = assignmentsMap.get(user2.id)!;

    const session = await ChallengeSessionService.startSession(user2AssignmentId, user2.id);
    assert(session.status === SessionStatus.ACTIVE, 'Session started with ACTIVE status');

    const duration = session.expiresAt.getTime() - session.startedAt.getTime();
    assert(duration === 30000, `ExpiresAt is exactly 30,000 ms after StartedAt (${duration} ms)`);

    // ----------------------------------------------------
    // TEST 5: Double Submission Prevention
    // ----------------------------------------------------
    console.log('\n--- Test 5: Double Submission Protection ---');
    const submit1 = await ChallengeSessionService.submitAnswer({
      sessionId: session.id,
      userId: user2.id,
      answerPayload: { answer: 'Tokyo', text: 'test', clickCount: 10, clicks: [1, 2, 3, 4, 5] },
    });

    assert(submit1.success, 'First submission accepted');

    const submit2 = await ChallengeSessionService.submitAnswer({
      sessionId: session.id,
      userId: user2.id,
      answerPayload: { answer: 'Tokyo' },
    });

    assert(!submit2.success, 'Second submission rejected atomically (already completed)');

    // ----------------------------------------------------
    // TEST 6: Security - Cross-User Session Tampering
    // ----------------------------------------------------
    console.log('\n--- Test 6: Security Authorization ---');
    const user3 = users[2];
    const maliciousSubmit = await ChallengeSessionService.submitAnswer({
      sessionId: session.id,
      userId: user3.id, // User 3 trying to submit User 2's session
      answerPayload: { answer: 'Tokyo' },
    });

    assert(!maliciousSubmit.success, 'User 3 prevented from submitting User 2 session');

    // ----------------------------------------------------
    // TEST 7: Pool Exhaustion Explicit Detection
    // ----------------------------------------------------
    console.log('\n--- Test 7: Challenge Pool Exhaustion Detection ---');
    const fakeUser = await prisma.user.create({
      data: {
        username: 'exhausted_test_user_' + Date.now(),
        email: `exhausted_${Date.now()}@test.com`,
        passwordHash: 'hash',
      },
    });

    const allChallenges = await prisma.challenge.findMany({ select: { id: true } });
    // Assign all active challenges to fakeUser across distinct dates
    for (let i = 0; i < allChallenges.length; i++) {
      const year = 1990 + Math.floor(i / 300);
      const month = String(Math.floor((i % 300) / 25) + 1).padStart(2, '0');
      const day = String((i % 25) + 1).padStart(2, '0');
      const dStr = `${year}-${month}-${day}`;

      await prisma.challengeAssignment.create({
        data: {
          userId: fakeUser.id,
          challengeId: allChallenges[i].id,
          assignedDate: dStr,
        },
      });
    }

    const exhaustedRes = await ChallengeAssignmentService.getOrAssignDailyChallenge(fakeUser.id, '2026-08-20');
    assert(exhaustedRes.status === 'EXHAUSTED', 'Exhaustion correctly detected when no eligible challenges remain');
    assert(
      exhaustedRes.message?.includes('pool is exhausted') || false,
      'Clear exhaustion warning message provided'
    );

    // Clean fake user data
    await prisma.challengeAssignment.deleteMany({ where: { userId: fakeUser.id } });
    await prisma.user.delete({ where: { id: fakeUser.id } });

    // Clean test assignments
    await prisma.submission.deleteMany({
      where: { session: { assignment: { assignedDate: testDateStr } } },
    });
    await prisma.challengeSession.deleteMany({
      where: { assignment: { assignedDate: testDateStr } },
    });
    await prisma.challengeAssignment.deleteMany({
      where: { assignedDate: testDateStr },
    });

    console.log(`\n🎉 SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
    if (failed === 0) {
      console.log('✅ ALL VERIFICATION TESTS PASSED PERFECTLY!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test suite failed with exception:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
