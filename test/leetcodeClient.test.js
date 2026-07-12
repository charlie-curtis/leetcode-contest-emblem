import test from 'node:test';
import assert from 'node:assert/strict';
import { LeetCodeClient } from '../src/leetcodeClient.js';

test('getContestData rejects virtual mode explicitly', async () => {
  const client = new LeetCodeClient({ leetcodeSession: 'test-session' });

  await assert.rejects(
    client.getContestData('RandomUserName554', { contestMode: 'virtual' }),
    (error) => {
      assert.equal(error.statusCode, 501);
      assert.match(error.message, /Virtual contest mode is selectable/);
      return true;
    }
  );
});
