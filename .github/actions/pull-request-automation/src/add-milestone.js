const REFERENCE_MAJOR = 5;
const REFERENCE_MINOR = 0;
const REFERENCE_DATE = '2019-07-29';

async function addMilestone( context, octokit ) {
	if ( ! context.payload.pull_request.merged ) {
		return;
	}

	if ( context.payload.pull_request.base.ref !== 'master' ) {
		return;
	}

	const { milestone } = await octokit.issues.get( {
		owner: context.payload.repository.owner.login,
		repo: context.payload.repository.name,
		issue_number: context.payload.pull_request.number,
	} );

	if ( milestone ) {
		return;
	}

	const { content } = await octokit.repos.getContents( {
		owner: context.payload.repository.owner.login,
		repo: context.payload.repository.name,
		path: 'package.json',
	} );

	const { version } = JSON.parse( content );

	let [ major, minor, ] = version.split( '.' ).map( Number );

	if ( minor === 9 ) {
		major += 1;
		minor = 0;
	} else {
		minor += 1;
	}

	const numVersionsElapsed = ( major - REFERENCE_MAJOR ) * 10 + ( minor - REFERENCE_MINOR );
	const numDaysElapsed = numVersionsElapsed * 14;

	const dueDate = new Date( REFERENCE_DATE );
	dueDate.setDate( dueDate.getDate() + numDaysElapsed );

	// TODO: Is .number returned when milestone already exists?
	const { number } = await octokit.issues.createMilestone( {
		owner: context.payload.repository.owner.login,
		repo: context.payload.repository.name,
		title: `Gutenberg ${ major }.${ minor }`,
	} );

	await octokit.issues.update( {
		owner: context.payload.repository.owner.login,
		repo: context.payload.repository.name,
		issue_number: context.payload.pull_request.number,
		milestone: number,
	} );
}

module.exports = addMilestone;
