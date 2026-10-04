// Plain Date getters instead of Intl: Hermes' toLocaleString with options costs ~25ms a call,
// which froze the mobile Analytics tab for 5s on a 200-point series.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export interface DateParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export function utcParts(d: Date): DateParts {
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds()
  }
}

export function localParts(d: Date): DateParts {
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds()
  }
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** "Aug 21" */
export function monthDay(p: DateParts): string {
  return `${MONTHS[p.month]} ${p.day}`
}

/** en-US 12-hour clock: "2 PM" (numeric) or "02 PM" (2-digit), optionally with minutes/seconds. */
export function clock12(p: DateParts, opts: { padHour: boolean; minutes: boolean; seconds?: boolean }): string {
  const h = p.hour % 12 === 0 ? 12 : p.hour % 12
  let out = opts.padHour ? pad2(h) : String(h)
  if (opts.minutes) out += `:${pad2(p.minute)}`
  if (opts.seconds) out += `:${pad2(p.second)}`
  return `${out} ${p.hour < 12 ? 'AM' : 'PM'}`
}

/** 24-hour "14:00". */
export function clock24(p: DateParts): string {
  return `${pad2(p.hour)}:${pad2(p.minute)}`
}
