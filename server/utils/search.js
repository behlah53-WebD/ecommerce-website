function filterDetails(detailsList = [], searchQuery = "") {
  const query = String(searchQuery || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!query) return detailsList;

  return detailsList.filter((item) => {
    const firstName = String(item.firstName || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    const lastName = String(item.lastName || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    const email = String(item.email || "").trim().toLowerCase();
    const phone = String(item.phone || "").trim().toLowerCase();
    const username = String(item.username || "").trim().toLowerCase();
    const city = String(item.city || "").trim().toLowerCase();
    const state = String(item.state || "").trim().toLowerCase();

    const fullName = `${firstName} ${lastName}`.trim();
    const reverseFullName = `${lastName} ${firstName}`.trim();

    return (
      firstName.includes(query) ||
      lastName.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      username.includes(query) ||
      city.includes(query) ||
      state.includes(query) ||
      fullName.includes(query) ||
      reverseFullName.includes(query)
    );
  });
}

module.exports = { filterDetails };