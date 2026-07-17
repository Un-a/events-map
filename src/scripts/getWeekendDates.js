function getWeekendDates(overrideSaturday = null, overrideSunday = null) {
  if (overrideSaturday && overrideSunday) {
    return {
      saturday: overrideSaturday,
      sunday: overrideSunday
    };
  }

  const today = new Date();
  const dayOfWeek = today.getDay();

  const daysUntilSaturday = dayOfWeek === 6 ? 0
    : dayOfWeek === 0 ? -1
    : 6 - dayOfWeek;

  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);

  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  const format = (d) => `${d.getDate()} ${['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'][d.getMonth()]}`;

  return {
    saturday: format(saturday),
    sunday: format(sunday)
  };
}

module.exports = { getWeekendDates };