const xt = require('xtal-test/index');
const test = require('tape');
async function customTests(page) {
    await page.waitFor(4000);
    const textContent = await page.$eval('#target', (c) => c.innerHTML);
    const TapeTestRunner = {
        test: test
    };
    TapeTestRunner.test('testing dev.html', (t) => {
        t.equal(textContent, 'hello');
        t.end();
    });
}
(async () => {
    await xt.runTests({
        path: 'demo/dev.html'
    }, customTests);
})();
