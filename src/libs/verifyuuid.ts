export const isValidUUId = (uuid: string) => {
  const regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

  return regex.test(uuid)

  // return uuid.split('-').length === 5
}
