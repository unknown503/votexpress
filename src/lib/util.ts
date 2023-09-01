import dayjs from "dayjs"

export const getInitialNameLetters = (fullname?: string | null) => {
  const splittedName = fullname?.split(" ")
  if (!splittedName || splittedName.length === 0) return
  return splittedName[0][0] + splittedName[1][0]
}

export function getAge(birthday: number) {
  return Math.abs(dayjs(birthday).diff(dayjs(), 'year'))
}

export const getName = (full: string) => full.split(" ")[0]
