/**
 * GitHub dependencies
 */
const core = require( '@actions/core' );
const { context, GitHub } = require( '@actions/github' );

/**
 * Internal dependencies
 */
const assignFixedIssues = require( './assign-fixed-issues' );
const addFirstTimeContributorLabel = require( './add-first-time-contributor-label' );
const addMilestone = require( './add-milestone' );

( async function main() {
	if ( context.eventName !== 'pull_request' ) {
		core.setFailed( 'main: Only `pull_request` events are supported' );
		return;
	}

	const octokit = new GitHub( core.getInput( 'github_token' ) );

	if ( context.action === 'opened' ) {
		try {
			core.debug( 'assign-fixed-issues' );
			await assignFixedIssues( context, octokit );
		} catch ( error ) {
			core.setFailed( `assign-fixed-issues: ${ error }` )
			return;
		}

		try {
			core.debug( 'add-first-time-contributor-label' );
			await addFirstTimeContributorLabel( context, octokit );
		} catch ( error ) {
			core.setFailed( `add-first-time-contributor-label: ${ error }` )
			return;
		}
	}

	if ( context.action === 'closed' ) {
		try {
			core.debug( 'add-milestone' );
			await addMilestone( context, octokit );
		} catch ( error ) {
			core.setFailed( `add-milestone: ${ error }` )
			return;
		}
	}
} )();
