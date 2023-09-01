# Pending


# Done
- Assign color to each candidate when created
- Elegible candidate toggle
- Remove all candidates button
- Check issues when setting cc
- Remove user option
- 'Hacer admin' button
- Redirect if user logs out
- Improve loading buttons
- Fix breadcrumbs

# Radikal Voting
Only one votation process can be present at a time.

### Admin
- Start/end votation process.
- Add candidates with their own information.
- Visualize votation results before and after ending votations.

### User
- Can vote and see candidates. 
- Can links a Metamask address to their main account.

### Both
- Can login to their account. - Signature request

### Votes
- When there is no votation in progress, hide votes on candidates page X
- When there is no votation in progress, show last votes on votation page along with stadistics

- When votation is started, every candidate will start with zero votes and previous ones will be replaced.

- When votation is in progress, votes will be shown on both pages, along with stadistics.

## Libraries
- Next-auth
- Mongoose (Mongodb Atlas)

## VotingContract
```
	candidates = [
		{
			id: uint,
			fullname: string,
			picture: string,
			group: string,
			proposals: [string],
			projects: [string],
			age: number,
			createdBy: msg.sender,
			createdAt: block.timestamp
		}
	]
```
```
	votes = [
		{
			candidate_id: uint,
			votes: uint,
		}
	]
```
```
	addCandidate(...args)
	removeCandidate(candidate_id)
	addVote(candidate_id)
```