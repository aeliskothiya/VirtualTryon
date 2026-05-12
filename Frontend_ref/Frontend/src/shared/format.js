export function formatDateTime(value) {
  if (!value) {
    return 'Unavailable'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
