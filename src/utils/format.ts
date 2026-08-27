/** Small formatters shared across screens. Kept out of page modules so fast refresh stays clean. */

/**
 * Ref. 30, 46 — the Application Number is decodable, not a random string:
 * [DEPT][POST][YYYYMMDD][TESTTYPE][SERIES][SEQ].
 */
export function decodeApplicationNo(applicationNo: string) {
  return `${applicationNo} — department + post code · submission date · test type · question paper series · sequence`
}

/** Ref. 82 — ticket number encodes DDMMYY + HHMMSS + type digit + sequence. */
export function decodeTicketNo(ticketNo: string) {
  return `date ${ticketNo.slice(0, 6)} · time ${ticketNo.slice(6, 12)} · type ${ticketNo.slice(12, 13)} · sequence ${ticketNo.slice(13)}`
}

export const inr = (value: number) => `₹ ${value.toLocaleString('en-IN')}`
