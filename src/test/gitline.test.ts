import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { it, expect, test, beforeEach } from 'vitest';

import Gitline from '../main/ts/Main';
import { Commit } from '../main/ts/Commit';

declare module 'vitest' {
  export interface TestContext {
    example02: { [key: string]: unknown }
  }
}

test('Gitline', () => {
  beforeEach(async (context) => {
    context.example02 = JSON.parse(await readFile(path.join(__dirname, 'data/example02.json'), 'utf8'));
  })

  it('should be able to process git2json output', ({ example02 }) => {
    const gitline = new Gitline();
    gitline.data = structuredClone(example02);
    
    // Initialize data externally, to circumvent JSON operation
    Object.keys(example02).forEach(function(key) {
      gitline.addCommit(new Commit(gitline, example02[key]))
    });

    gitline.buildGraph();

    const aCommit = gitline.commits['ab275b54c60ae953a9a48b09e72f3b4a20265de8'];
    expect(aCommit.directparent.getFullSha()).toBe('822428bc12c8eec7971a48970a397df4e1ff661e');
    expect(aCommit.branch.ref).toBe('origin/feature/GL-20-invoker');
  });
});
