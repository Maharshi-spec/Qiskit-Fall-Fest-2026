// Mock service for hackathon
const teams = new Map()

export async function getHackathonInfo() {
  return {
    title: 'Quantum Hackathon 2026',
    description: 'Build innovative quantum applications',
    startDate: '2026-09-17',
    endDate: '2026-09-18',
    prizes: [
      { place: '1st', amount: '$1000' },
      { place: '2nd', amount: '$500' },
      { place: '3rd', amount: '$250' }
    ]
  }
}

export async function createTeam(data) {
  const teamId = Date.now().toString()
  const team = {
    teamId,
    ...data,
    members: [data.leaderId],
    createdAt: new Date()
  }
  teams.set(teamId, team)
  return team
}

export async function getAllTeams() {
  return Array.from(teams.values())
}

export async function getTeam(teamId) {
  const team = teams.get(teamId)
  if (!team) {
    throw new Error('Team not found')
  }
  return team
}

export async function updateTeam(teamId, data) {
  const team = teams.get(teamId)
  if (!team) {
    throw new Error('Team not found')
  }
  const updated = { ...team, ...data, updatedAt: new Date() }
  teams.set(teamId, updated)
  return updated
}

export async function addMember(teamId, data) {
  const team = teams.get(teamId)
  if (!team) {
    throw new Error('Team not found')
  }
  const memberId = data.memberId
  if (!team.members.includes(memberId)) {
    team.members.push(memberId)
  }
  return team
}

export async function removeMember(teamId, data) {
  const team = teams.get(teamId)
  if (!team) {
    throw new Error('Team not found')
  }
  const memberId = data.memberId
  const index = team.members.indexOf(memberId)
  if (index > -1) {
    team.members.splice(index, 1)
  }
  return team
}
