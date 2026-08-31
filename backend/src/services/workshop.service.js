// Mock service for workshops
const workshops = new Map()
const attendees = new Map()

export async function getAllWorkshops() {
  return Array.from(workshops.values())
}

export async function getWorkshop(id) {
  const workshop = workshops.get(id)
  if (!workshop) {
    throw new Error('Workshop not found')
  }
  return workshop
}

export async function registerAttendee(workshopId, data) {
  const workshop = workshops.get(workshopId)
  if (!workshop) {
    throw new Error('Workshop not found')
  }
  
  const attendeeId = data.attendeeId
  if (!attendees.has(workshopId)) {
    attendees.set(workshopId, [])
  }
  
  const list = attendees.get(workshopId)
  if (!list.includes(attendeeId)) {
    list.push(attendeeId)
  }
  
  return { ...workshop, attendeeCount: list.length }
}

export async function unregisterAttendee(workshopId, data) {
  const attendeeId = data.attendeeId
  const list = attendees.get(workshopId)
  if (list) {
    const index = list.indexOf(attendeeId)
    if (index > -1) {
      list.splice(index, 1)
    }
  }
}

export async function getWorkshopAttendees(workshopId) {
  return attendees.get(workshopId) || []
}
