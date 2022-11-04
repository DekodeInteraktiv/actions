const { createHtmlReport } = require('axe-html-reporter');
const { getOctokit, context: githubContext } = require('@actions/github');
const { setFailed, getInput } = require('@actions/core');
const AWS = require('aws-sdk');
const AxeBuilder = require('@axe-core/playwright').default;
const playwright = require('playwright');
const MD5 = require('crypto-js/md5');

(async () => {
	const token = getInput('github_token');
	const accessKeyId = getInput('aws_access_key_id');
	const secretAccessKey = getInput('aws_secret_access_key');
	const comment = getInput('comment');
	const pr = getInput('pr');

	if (!token || !accessKeyId || !secretAccessKey || !comment || !pr) {
		return setFailed('Missing required inputs');
	}

	const octokit = getOctokit(token);
	const payload = githubContext.payload;
	const browser = await playwright.chromium.launch();
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.goto(comment.replace('AXE: ', ''));

	try {
		const results = await new AxeBuilder({ page }).analyze();

		const hash = MD5(
			`${payload.repository.name}-${pr}-${Math.floor(Date.now() / 1000)}`,
		).toString();

		const filename = `report-${hash}.html`;

		const reportHTML = createHtmlReport({
			results,
			options: {
				projectKey: 'AXE ACTION',
				doNotCreateReportFile: true,
			},
		});

		const s3 = new AWS.S3({
			accessKeyId,
			secretAccessKey,
		});

		await s3
			.upload({
				Bucket: 'axe-report',
				Key: filename,
				Body: reportHTML,
				ContentType: 'text/html',
			})
			.promise();

		octokit.rest.issues.createComment({
			owner: payload.repository.owner.login,
			repo: payload.repository.name,
			issue_number: parseInt(pr, 10),
			body: `https://axe-report.s3.eu-west-3.amazonaws.com/${filename}`,
		});
	} catch (e) {
		// do something with the error
		console.log(e);
	}
	await browser.close();
})();
