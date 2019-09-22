import { IXtalTestRunner, IXtalTestRunnerOptions } from 'xtal-test/index.js';
const xt = require('xtal-test/index') as IXtalTestRunner;
const test = require('tape');
import { Page } from "puppeteer"; //typescript
import { Test } from "tape";
async function customTests(page: Page) {
    await page.waitFor(4000);
    const textContent = await page.$eval('#target', (c: any) => c.innerHTML);
    const TapeTestRunner = {
        test: test
    } as Test;
    TapeTestRunner.test('testing dev.html', (t: any) => {
        t.equal(textContent, 'hello');
        t.end();
    });

}

(async () => {
    await xt.runTests({
        path: 'demo/dev.html'
    }, customTests);
})();