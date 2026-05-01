const bookingStorageKey = "mechgo-bookings";
const verificationStorageKey = "mechgo-driver-verifications";
const customerProfilesStorageKey = "mechgo-customer-profiles";
const mechanicProfilesStorageKey = "mechgo-mechanic-profiles";
const authAccountsStorageKey = "mechgo-auth-accounts";
const supportReportsStorageKey = "mechgo-support-reports";
const adminAccountsStorageKey = "mechgo-admin-accounts";
const adminSessionStorageKey = "mechgo-admin-session";

const membershipPlans = {
  starter: "Roadside Starter",
  traveler: "Traveler Plus",
  priority: "Priority Family",
};

const defaultAdminAccounts = [];

const trackedPlatformKeys = [
  bookingStorageKey,
  verificationStorageKey,
  customerProfilesStorageKey,
  mechanicProfilesStorageKey,
  authAccountsStorageKey,
  supportReportsStorageKey,
];

const elements = {
  toast: document.querySelector("#toast"),
  adminSignInForm: document.querySelector("#adminSignInForm"),
  adminIdentifier: document.querySelector("#adminIdentifier"),
  adminPassword: document.querySelector("#adminPassword"),
  adminSignOutButton: document.querySelector("#adminSignOutButton"),
  adminSignOutButtonHero: document.querySelector("#adminSignOutButtonHero"),
  adminAnchorLinks: Array.from(document.querySelectorAll("[data-admin-anchor]")),
  adminDashboardGreeting: document.querySelector("#adminDashboardGreeting"),
  adminDashboardMeta: document.querySelector("#adminDashboardMeta"),
  adminSessionBadge: document.querySelector("#adminSessionBadge"),
  adminSessionName: document.querySelector("#adminSessionName"),
  adminSessionMeta: document.querySelector("#adminSessionMeta"),
  adminHealthSummary: document.querySelector("#adminHealthSummary"),
  adminWatchlistBadge: document.querySelector("#adminWatchlistBadge"),
  adminPendingVerificationText: document.querySelector("#adminPendingVerificationText"),
  adminSupportComplaintText: document.querySelector("#adminSupportComplaintText"),
  adminLatestBookingText: document.querySelector("#adminLatestBookingText"),
  adminMetricCustomers: document.querySelector("#adminMetricCustomers"),
  adminMetricMechanics: document.querySelector("#adminMetricMechanics"),
  adminMetricBookings: document.querySelector("#adminMetricBookings"),
  adminMetricIssues: document.querySelector("#adminMetricIssues"),
  adminCustomerCount: document.querySelector("#adminCustomerCount"),
  adminCustomerList: document.querySelector("#adminCustomerList"),
  adminMechanicCount: document.querySelector("#adminMechanicCount"),
  adminMechanicList: document.querySelector("#adminMechanicList"),
  adminBookingCount: document.querySelector("#adminBookingCount"),
  adminBookingList: document.querySelector("#adminBookingList"),
  adminSupportCount: document.querySelector("#adminSupportCount"),
  adminSupportList: document.querySelector("#adminSupportList"),
  adminVerificationCount: document.querySelector("#adminVerificationCount"),
  adminVerificationList: document.querySelector("#adminVerificationList"),
};

const state = {
  adminAccounts: loadAdminAccounts(),
  adminSession: loadAdminSession(),
  customerProfiles: [],
  mechanicProfiles: [],
  authAccounts: [],
  bookings: [],
  supportReports: [],
  driverVerifications: [],
};

let toastTimer = 0;

initializeAdminPortal();

function initializeAdminPortal() {
  seedAdminAccounts();
  reloadPlatformState();
  synchronizeAdminSession();
  bindAdminEvents();
  enforceAdminPageAccess();

  if (isAdminDashboardPage()) {
    renderAdminDashboard();
  }

  syncAnchorState();
  applyInteractiveSurfaceEffects();
  window.addEventListener("hashchange", syncAnchorState);
  window.addEventListener("storage", handleStorageSync);
}

function bindAdminEvents() {
  if (elements.adminSignInForm) {
    elements.adminSignInForm.addEventListener("submit", handleAdminSignInSubmit);
  }

  [elements.adminSignOutButton, elements.adminSignOutButtonHero]
    .filter(Boolean)
    .forEach((button) => {
      button.addEventListener("click", handleAdminSignOut);
    });

  elements.adminAnchorLinks.forEach((link) => {
    link.addEventListener("click", () => {
      window.setTimeout(syncAnchorState, 0);
    });
  });
}

async function handleAdminSignInSubmit(event) {
  event.preventDefault();

  if (!elements.adminIdentifier || !elements.adminPassword) {
    return;
  }

  const identifier = normalizeIdentifier(elements.adminIdentifier.value);
  const password = elements.adminPassword.value;
  if (window.MechGoApi) {
    try {
      const payload = await window.MechGoApi.login({
        identifier: elements.adminIdentifier.value.trim(),
        password,
      });
      if (!payload.user || payload.user.role !== "admin") {
        showToast("That account is not authorized for the admin portal.");
        return;
      }

      const adminAccount = mapApiUserToAdminAccount(payload.user);
      state.adminAccounts = [
        adminAccount,
        ...state.adminAccounts.filter((entry) => entry.id !== adminAccount.id),
      ];
      persistStoredArray(adminAccountsStorageKey, state.adminAccounts);
      setSignedInAdminAccount(adminAccount);
      window.location.href = "admin-dashboard.html";
      return;
    } catch (error) {
      if (!state.adminAccounts.length) {
        showToast(error.message || "Admin API sign-in failed. Check the API server and credentials.");
        return;
      }
    }
  }

  if (!state.adminAccounts.length) {
    showToast("No local admin account is configured. Use the API bootstrap endpoint for production admin setup.");
    return;
  }
  const account =
    state.adminAccounts.find(
      (entry) =>
        normalizeUsername(entry.username) === identifier ||
        normalizeEmail(entry.email) === identifier
    ) || null;

  if (!account || account.password !== password) {
    showToast("Admin sign-in failed. Check the username/email and password.");
    return;
  }

  setSignedInAdminAccount(account);
  window.location.href = "admin-dashboard.html";
}

function handleAdminSignOut() {
  clearAdminSession();
  window.location.href = "admin-signin.html";
}

function handleStorageSync(event) {
  if (!event.key || trackedPlatformKeys.includes(event.key)) {
    reloadPlatformState();
  }

  if (!event.key || event.key === adminAccountsStorageKey) {
    state.adminAccounts = loadAdminAccounts();
  }

  if (!event.key || event.key === adminSessionStorageKey) {
    state.adminSession = loadAdminSession();
    synchronizeAdminSession();
    enforceAdminPageAccess();
  }

  if (isAdminDashboardPage()) {
    renderAdminDashboard();
  }

  syncAnchorState();
}

function renderAdminDashboard() {
  const activeAdmin = getActiveAdminAccount();
  if (!activeAdmin) {
    return;
  }

  const driverRecords = getSortedCustomers();
  const mechanicRecords = getSortedMechanics();
  const bookings = getSortedBookings();
  const supportReports = getSortedSupportReports();
  const verificationRecords = getSortedVerifications();
  const pendingVerifications = verificationRecords.filter(
    (entry) => normalizeIdentifier(entry.status) === "pending review"
  ).length;
  const openIssues = supportReports.filter(
    (entry) => normalizeIdentifier(entry.status) !== "resolved"
  ).length;
  const latestBooking = bookings[0] || null;

  setText(elements.adminDashboardGreeting, `${activeAdmin.displayName || "MechGo Command"} dashboard`);
  setText(
    elements.adminDashboardMeta,
    `Signed in as ${formatAdminHandle(activeAdmin.username)}. This portal reads live MechGo registrations, dispatch activity, support complaints, and verification submissions from the main app.`
  );
  setText(elements.adminSessionBadge, titleCase(activeAdmin.role || "admin"));
  setText(elements.adminSessionName, formatAdminHandle(activeAdmin.username));
  setText(
    elements.adminSessionMeta,
    `${activeAdmin.email} | Signed in ${formatSubmissionTime(
      state.adminSession ? state.adminSession.signedInAt : activeAdmin.updatedAt
    )}`
  );
  setText(
    elements.adminHealthSummary,
    `MechGo is tracking ${bookings.length} booking${bookings.length === 1 ? "" : "s"}, ${openIssues} open issue${
      openIssues === 1 ? "" : "s"
    }, and ${pendingVerifications} verification request${pendingVerifications === 1 ? "" : "s"} waiting for review.`
  );
  setText(
    elements.adminWatchlistBadge,
    openIssues || pendingVerifications ? "Action needed" : "Healthy"
  );
  setText(
    elements.adminPendingVerificationText,
    pendingVerifications
      ? `${pendingVerifications} driver submission${pendingVerifications === 1 ? "" : "s"} still need review.`
      : "No driver submissions are currently waiting."
  );
  setText(
    elements.adminSupportComplaintText,
    openIssues
      ? `${openIssues} support complaint${openIssues === 1 ? "" : "s"} are still open.`
      : "No open support complaints right now."
  );
  setText(
    elements.adminLatestBookingText,
    latestBooking
      ? `${latestBooking.customerName || formatHandle(latestBooking.customerUsername)} requested ${
          latestBooking.serviceType || "roadside help"
        } with ${latestBooking.mechanicName} on ${formatSubmissionTime(latestBooking.createdAt)}.`
      : "No bookings have been recorded yet."
  );

  setText(elements.adminMetricCustomers, String(driverRecords.length));
  setText(elements.adminMetricMechanics, String(mechanicRecords.length));
  setText(elements.adminMetricBookings, String(bookings.length));
  setText(elements.adminMetricIssues, String(openIssues));

  renderAdminCustomers(driverRecords);
  renderAdminMechanics(mechanicRecords);
  renderAdminBookings(bookings);
  renderAdminSupportReports(supportReports);
  renderAdminVerifications(verificationRecords);
  applyInteractiveSurfaceEffects();
  syncAnchorState();
}

function renderAdminCustomers(records) {
  if (!elements.adminCustomerList || !elements.adminCustomerCount) {
    return;
  }

  setText(elements.adminCustomerCount, `${records.length} record${records.length === 1 ? "" : "s"}`);

  if (!records.length) {
    renderEmptyState(elements.adminCustomerList, "No driver or customer registrations yet.");
    return;
  }

  elements.adminCustomerList.innerHTML = records
    .map((record) => {
      const vehicleSummary = [record.vehicle, record.secondaryVehicle].filter(Boolean).join(" | ");
      const verificationSummary = [
        record.emailVerified ? "Email verified" : "Email pending",
        record.phoneVerified ? "Phone verified" : "Phone pending",
      ].join(" | ");

      return `
        <article class="customer-panel admin-card" data-interactive-surface>
          <div class="panel-heading">
            <div>
              <p class="customer-card-status">Driver registration</p>
              <h3 class="customer-card-name">${escapeHtml(record.name)}</h3>
            </div>
            <span class="status-pill">${escapeHtml(record.membership)}</span>
          </div>
          <p class="customer-panel-copy">${escapeHtml(
            `${record.handle} joined ${formatSubmissionTime(record.joinedAt)} and is centered in ${record.homeCity}.`
          )}</p>
          <div class="admin-badge-row">
            <span class="admin-chip">${escapeHtml(record.handle)}</span>
            <span class="admin-chip">${escapeHtml(formatPlatformLabel(record.sourcePlatform, record.provider))}</span>
            <span class="admin-chip">${escapeHtml(vehicleSummary || "No vehicle saved")}</span>
            <span class="admin-chip">${record.paymentMethodCount} payment method${
              record.paymentMethodCount === 1 ? "" : "s"
            }</span>
          </div>
          <div class="admin-card-meta">
            <span><strong>Contact:</strong> ${escapeHtml(`${record.email} | ${record.phone}`)}</span>
            <span><strong>Address:</strong> ${escapeHtml(record.address || "No address saved")}</span>
            <span><strong>Vehicle details:</strong> ${escapeHtml(
              record.plateNumber ? `${vehicleSummary || record.vehicle} | Plate ${record.plateNumber}` : vehicleSummary || "No vehicle details saved"
            )}</span>
            <span><strong>Account status:</strong> ${escapeHtml(verificationSummary)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAdminMechanics(records) {
  if (!elements.adminMechanicList || !elements.adminMechanicCount) {
    return;
  }

  setText(elements.adminMechanicCount, `${records.length} record${records.length === 1 ? "" : "s"}`);

  if (!records.length) {
    renderEmptyState(elements.adminMechanicList, "No mechanic registrations yet.");
    return;
  }

  elements.adminMechanicList.innerHTML = records
    .map((record) => {
      const specialtySummary = record.specialties.length
        ? record.specialties.map((entry) => titleCase(entry)).join(", ")
        : "No specialties saved";

      return `
        <article class="customer-panel admin-card" data-interactive-surface>
          <div class="panel-heading">
            <div>
              <p class="customer-card-status">Mechanic registration</p>
              <h3 class="customer-card-name">${escapeHtml(record.businessName)}</h3>
            </div>
            <span class="status-pill">${escapeHtml(record.credentialStatus)}</span>
          </div>
          <p class="customer-panel-copy">${escapeHtml(
            `${record.handle} joined ${formatSubmissionTime(record.joinedAt)} and operates from ${record.baseCity}.`
          )}</p>
          <div class="admin-badge-row">
            <span class="admin-chip">${escapeHtml(record.handle)}</span>
            <span class="admin-chip">${escapeHtml(`${record.serviceRadiusMiles} mile radius`)}</span>
            <span class="admin-chip">${record.payoutMethodCount} receiving method${
              record.payoutMethodCount === 1 ? "" : "s"
            }</span>
          </div>
          <div class="admin-card-meta">
            <span><strong>Contact:</strong> ${escapeHtml(`${record.email} | ${record.phone}`)}</span>
            <span><strong>Lead and dispatch:</strong> ${escapeHtml(
              `${record.leadName} | ${record.dispatchMode} | ${record.jobsCompleted} completed jobs`
            )}</span>
            <span><strong>Specialties:</strong> ${escapeHtml(specialtySummary)}</span>
            <span><strong>Coverage:</strong> ${escapeHtml(
              `${record.baseCity}${record.baseAddress ? ` | ${record.baseAddress}` : ""}${
                record.serviceVehicle ? ` | ${record.serviceVehicle}` : ""
              }`
            )}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAdminBookings(records) {
  if (!elements.adminBookingList || !elements.adminBookingCount) {
    return;
  }

  setText(elements.adminBookingCount, `${records.length} booking${records.length === 1 ? "" : "s"}`);

  if (!records.length) {
    renderEmptyState(elements.adminBookingList, "No bookings have been created from the marketplace yet.");
    return;
  }

  elements.adminBookingList.innerHTML = records
    .map(
      (record) => `
        <article class="customer-panel admin-card" data-interactive-surface>
          <div class="panel-heading">
            <div>
              <p class="customer-card-status">Dispatch booking</p>
              <h3 class="customer-card-name">${escapeHtml(
                `${record.customerName || formatHandle(record.customerUsername)} -> ${record.mechanicName}`
              )}</h3>
            </div>
            <span class="status-pill">${escapeHtml(record.status || "Scheduled")}</span>
          </div>
          <p class="customer-panel-copy">${escapeHtml(
            `${titleCase(record.serviceType || "roadside help")} in ${record.city} with ${record.etaMinutes || "--"} minute ETA.`
          )}</p>
          <div class="admin-badge-row">
            <span class="admin-chip">${escapeHtml(record.quoteRangeLabel || "Quote pending")}</span>
            <span class="admin-chip">${escapeHtml(record.distanceLabel || "Distance pending")}</span>
            <span class="admin-chip">${escapeHtml(record.paymentMethodLabel || "Billing not saved")}</span>
          </div>
          <div class="admin-card-meta">
            <span><strong>Booked:</strong> ${escapeHtml(formatSubmissionTime(record.createdAt))}</span>
            <span><strong>Vehicle and contact:</strong> ${escapeHtml(
              `${record.vehicleInfo || "Vehicle not provided"} | ${record.customerPhone || "Phone not provided"}`
            )}</span>
            <span><strong>Location:</strong> ${escapeHtml(record.location || "No location provided")}</span>
            <span><strong>Notes:</strong> ${escapeHtml(record.notes || "No extra notes provided")}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAdminSupportReports(records) {
  if (!elements.adminSupportList || !elements.adminSupportCount) {
    return;
  }

  setText(elements.adminSupportCount, `${records.length} complaint${records.length === 1 ? "" : "s"}`);

  if (!records.length) {
    renderEmptyState(elements.adminSupportList, "No support complaints have been submitted yet.");
    return;
  }

  elements.adminSupportList.innerHTML = records
    .map(
      (record) => `
        <article class="customer-panel admin-card" data-interactive-surface>
          <div class="panel-heading">
            <div>
              <p class="customer-card-status">Support complaint</p>
              <h3 class="customer-card-name">${escapeHtml(record.subject || "Untitled report")}</h3>
            </div>
            <span class="status-pill">${escapeHtml(record.status || "Received")}</span>
          </div>
          <p class="customer-panel-copy">${escapeHtml(
            `${titleCase(record.category || "general")} | ${titleCase(record.severity || "medium")} | ${formatSubmissionTime(
              record.createdAt
            )}`
          )}</p>
          <div class="admin-card-meta">
            <span><strong>Reporter:</strong> ${escapeHtml(
              `${record.name || "Unknown"} | ${record.userType || "guest"} | ${record.email || "No email"}`
            )}</span>
            <span><strong>Booking reference:</strong> ${escapeHtml(record.bookingId || "No booking reference attached")}</span>
            <span><strong>Preferred contact:</strong> ${escapeHtml(record.contactMethod || "Email")}</span>
            <span><strong>Description:</strong> ${escapeHtml(record.description || "No description provided")}</span>
          </div>
          <div class="admin-card-actions">
            <button
              class="secondary-button"
              type="button"
              data-support-status="In review"
              data-report-id="${escapeHtml(record.id)}"
              ${record.status === "In review" || record.status === "Resolved" ? "disabled" : ""}
            >
              Mark in review
            </button>
            <button
              class="ghost-button"
              type="button"
              data-support-status="Resolved"
              data-report-id="${escapeHtml(record.id)}"
              ${record.status === "Resolved" ? "disabled" : ""}
            >
              Resolve
            </button>
          </div>
        </article>
      `
    )
    .join("");

  elements.adminSupportList.querySelectorAll("[data-support-status]").forEach((button) => {
    button.addEventListener("click", () => {
      updateSupportReportStatus(button.dataset.reportId, button.dataset.supportStatus);
    });
  });
}

function renderAdminVerifications(records) {
  if (!elements.adminVerificationList || !elements.adminVerificationCount) {
    return;
  }

  setText(
    elements.adminVerificationCount,
    `${records.length} submission${records.length === 1 ? "" : "s"}`
  );

  if (!records.length) {
    renderEmptyState(elements.adminVerificationList, "No driver verification submissions have arrived yet.");
    return;
  }

  elements.adminVerificationList.innerHTML = records
    .map((record) => {
      const documentSummary = (record.documents || [])
        .map((entry) => entry.name || entry.label || "Document")
        .join(", ");

      return `
        <article class="customer-panel admin-card" data-interactive-surface>
          <div class="panel-heading">
            <div>
              <p class="customer-card-status">Verification submission</p>
              <h3 class="customer-card-name">${escapeHtml(record.fullName || "Unknown driver")}</h3>
            </div>
            <span class="status-pill">${escapeHtml(record.status || "Pending review")}</span>
          </div>
          <p class="customer-panel-copy">${escapeHtml(
            `${record.vehicle || "Vehicle not provided"} | ${record.homeCity || "Home city not provided"} | ${formatSubmissionTime(
              record.submittedAt
            )}`
          )}</p>
          <div class="admin-card-meta">
            <span><strong>Contact:</strong> ${escapeHtml(`${record.email || "No email"} | ${record.phone || "No phone"}`)}</span>
            <span><strong>Documents:</strong> ${escapeHtml(documentSummary || "No document names captured")}</span>
          </div>
          <div class="admin-card-actions">
            <button
              class="secondary-button"
              type="button"
              data-verification-status="Approved"
              data-submission-id="${escapeHtml(record.id)}"
              ${record.status === "Approved" ? "disabled" : ""}
            >
              Approve
            </button>
            <button
              class="ghost-button"
              type="button"
              data-verification-status="Rejected"
              data-submission-id="${escapeHtml(record.id)}"
              ${record.status === "Rejected" ? "disabled" : ""}
            >
              Reject
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  elements.adminVerificationList
    .querySelectorAll("[data-verification-status]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        updateVerificationStatus(button.dataset.submissionId, button.dataset.verificationStatus);
      });
    });
}

function updateSupportReportStatus(reportId, nextStatus) {
  state.supportReports = state.supportReports.map((entry) =>
    entry.id === reportId ? { ...entry, status: nextStatus } : entry
  );
  persistStoredArray(supportReportsStorageKey, state.supportReports);
  renderAdminDashboard();
  showToast(`Support complaint updated to ${nextStatus}.`);
}

function updateVerificationStatus(submissionId, nextStatus) {
  state.driverVerifications = state.driverVerifications.map((entry) =>
    entry.id === submissionId ? { ...entry, status: nextStatus } : entry
  );
  persistStoredArray(verificationStorageKey, state.driverVerifications);
  renderAdminDashboard();
  showToast(`Verification updated to ${nextStatus}.`);
}

function getSortedCustomers() {
  const roleAccounts = state.authAccounts.filter((entry) => entry.role === "customer");
  const linkedProfileIds = new Set();
  const records = roleAccounts.map((account) => {
    const profile = resolveLinkedProfile(account, state.customerProfiles);
    if (profile) {
      linkedProfileIds.add(profile.id);
    }

    return {
      id: account.id,
      name: profile ? profile.fullName : account.displayName || account.username || "Customer",
      handle: formatHandle(account.username || (profile ? profile.username : "")),
      email: profile ? profile.email : account.email || "No email saved",
      phone: profile ? profile.phone || "No phone saved" : "No phone saved",
      homeCity: profile ? profile.homeCity || "No city saved" : "No city saved",
      address: profile ? profile.address || "" : "",
      vehicle: profile ? profile.vehicle || "" : "",
      secondaryVehicle: profile ? profile.secondaryVehicle || "" : "",
      plateNumber: profile ? profile.plateNumber || "" : "",
      membership: getMembershipPlanLabel(profile ? profile.membershipTier : ""),
      paymentMethodCount: profile && profile.paymentMethods ? profile.paymentMethods.length : 0,
      joinedAt: account.createdAt || (profile ? profile.joinedAt || profile.updatedAt : ""),
      sourcePlatform: account.sourcePlatform || (profile ? profile.sourcePlatform : "") || "web_app",
      provider: account.provider || "email",
      emailVerified: Boolean(account.settings && account.settings.emailVerified),
      phoneVerified: Boolean(account.settings && account.settings.phoneVerified),
    };
  });

  state.customerProfiles
    .filter((profile) => !linkedProfileIds.has(profile.id))
    .forEach((profile) => {
      records.push({
        id: profile.id,
        name: profile.fullName || profile.username || "Customer",
        handle: formatHandle(profile.username),
        email: profile.email || "No email saved",
        phone: profile.phone || "No phone saved",
        homeCity: profile.homeCity || "No city saved",
        address: profile.address || "",
        vehicle: profile.vehicle || "",
        secondaryVehicle: profile.secondaryVehicle || "",
        plateNumber: profile.plateNumber || "",
        membership: getMembershipPlanLabel(profile.membershipTier),
        paymentMethodCount: profile.paymentMethods ? profile.paymentMethods.length : 0,
        joinedAt: profile.joinedAt || profile.updatedAt,
        sourcePlatform: profile.sourcePlatform || "web_app",
        provider: "email",
        emailVerified: false,
        phoneVerified: false,
      });
    });

  return records.sort((left, right) => compareDateDesc(left.joinedAt, right.joinedAt));
}

function getSortedMechanics() {
  const roleAccounts = state.authAccounts.filter((entry) => entry.role === "mechanic");
  const linkedProfileIds = new Set();
  const records = roleAccounts.map((account) => {
    const profile = resolveLinkedProfile(account, state.mechanicProfiles);
    if (profile) {
      linkedProfileIds.add(profile.id);
    }
 
    return {
      id: account.id,
      businessName: profile ? profile.businessName : account.displayName || account.username || "Mechanic",
      handle: formatHandle(account.username || (profile ? profile.username : "")),
      email: profile ? profile.email : account.email || "No email saved",
      phone: profile ? profile.phone || "No phone saved" : "No phone saved",
      leadName: profile ? profile.leadName || "Lead not saved" : "Lead not saved",
      baseCity: profile ? profile.baseCity || "No base city saved" : "No base city saved",
      baseAddress: profile ? profile.baseAddress || "" : "",
      serviceRadiusMiles: profile ? profile.serviceRadiusMiles || 0 : 0,
      dispatchMode: titleCase(profile ? profile.dispatchMode || "dispatch pending" : "dispatch pending"),
      jobsCompleted: profile ? profile.jobsCompleted || 0 : 0,
      serviceVehicle: profile ? profile.serviceVehicle || "" : "",
      specialties: profile && profile.specialties ? profile.specialties : [],
      payoutMethodCount: profile && profile.payoutMethods ? profile.payoutMethods.length : 0,
      credentialStatus: profile ? profile.credentialStatus || "Credential review pending" : "Credential review pending",
      joinedAt: account.createdAt || (profile ? profile.joinedAt || profile.updatedAt : ""),
    };
  });

  state.mechanicProfiles
    .filter((profile) => !linkedProfileIds.has(profile.id))
    .forEach((profile) => {
      records.push({
        id: profile.id,
        businessName: profile.businessName || profile.username || "Mechanic",
        handle: formatHandle(profile.username),
        email: profile.email || "No email saved",
        phone: profile.phone || "No phone saved",
        leadName: profile.leadName || "Lead not saved",
        baseCity: profile.baseCity || "No base city saved",
        baseAddress: profile.baseAddress || "",
        serviceRadiusMiles: profile.serviceRadiusMiles || 0,
        dispatchMode: titleCase(profile.dispatchMode || "dispatch pending"),
        jobsCompleted: profile.jobsCompleted || 0,
        serviceVehicle: profile.serviceVehicle || "",
        specialties: profile.specialties || [],
        payoutMethodCount: profile.payoutMethods ? profile.payoutMethods.length : 0,
        credentialStatus: profile.credentialStatus || "Credential review pending",
        joinedAt: profile.joinedAt || profile.updatedAt,
      });
    });

  return records.sort((left, right) => compareDateDesc(left.joinedAt, right.joinedAt));
}

function getSortedBookings() {
  return [...state.bookings].sort((left, right) => compareDateDesc(left.createdAt, right.createdAt));
}

function getSortedSupportReports() {
  return [...state.supportReports].sort((left, right) => {
    const statusDelta = getSupportStatusRank(left.status) - getSupportStatusRank(right.status);
    return statusDelta || compareDateDesc(left.createdAt, right.createdAt);
  });
}

function getSortedVerifications() {
  return [...state.driverVerifications].sort((left, right) => {
    const statusDelta = getVerificationStatusRank(left.status) - getVerificationStatusRank(right.status);
    return statusDelta || compareDateDesc(left.submittedAt, right.submittedAt);
  });
}

function reloadPlatformState() {
  state.customerProfiles = loadStoredArray(customerProfilesStorageKey);
  state.mechanicProfiles = loadStoredArray(mechanicProfilesStorageKey);
  state.authAccounts = loadStoredArray(authAccountsStorageKey);
  state.bookings = loadStoredArray(bookingStorageKey);
  state.supportReports = loadStoredArray(supportReportsStorageKey);
  state.driverVerifications = loadStoredArray(verificationStorageKey);
}

function enforceAdminPageAccess() {
  const activeAdmin = getActiveAdminAccount();
  if (isAdminDashboardPage() && !activeAdmin) {
    window.location.replace("admin-signin.html");
  }
  if (isAdminSignInPage() && activeAdmin) {
    window.location.replace("admin-dashboard.html");
  }
}

function resolveLinkedProfile(account, profiles) {
  if (!account) {
    return null;
  }

  return (
    profiles.find((entry) => entry.id === account.profileId) ||
    profiles.find((entry) => normalizeUsername(entry.username) === normalizeUsername(account.username)) ||
    profiles.find((entry) => normalizeEmail(entry.email) === normalizeEmail(account.email)) ||
    null
  );
}

function seedAdminAccounts() {
  if (state.adminAccounts.length) {
    return;
  }

  state.adminAccounts = [];
}

function synchronizeAdminSession() {
  if (!state.adminSession) {
    return;
  }

  const activeAdmin = state.adminAccounts.find((entry) => entry.id === state.adminSession.accountId) || null;
  if (!activeAdmin) {
    clearAdminSession();
    return;
  }

  state.adminSession = {
    ...state.adminSession,
    username: activeAdmin.username,
  };
  localStorage.setItem(adminSessionStorageKey, JSON.stringify(state.adminSession));
}

function setSignedInAdminAccount(account) {
  state.adminSession = {
    accountId: account.id,
    username: account.username,
    signedInAt: new Date().toISOString(),
  };
  localStorage.setItem(adminSessionStorageKey, JSON.stringify(state.adminSession));
}

function mapApiUserToAdminAccount(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.fullName || user.username,
    role: "admin",
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };
}

function clearAdminSession() {
  state.adminSession = null;
  localStorage.removeItem(adminSessionStorageKey);
}

function getActiveAdminAccount() {
  if (!state.adminSession) {
    return null;
  }

  return state.adminAccounts.find((entry) => entry.id === state.adminSession.accountId) || null;
}

function applyInteractiveSurfaceEffects() {
  document.querySelectorAll("[data-interactive-surface]").forEach((surface) => {
    if (surface.dataset.surfaceBound === "true") {
      return;
    }

    surface.dataset.surfaceBound = "true";
    surface.addEventListener("pointermove", (event) => {
      const bounds = surface.getBoundingClientRect();
      surface.style.setProperty("--shine-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
      surface.style.setProperty("--shine-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
    });
    surface.addEventListener("pointerleave", () => {
      surface.style.removeProperty("--shine-x");
      surface.style.removeProperty("--shine-y");
    });
  });
}

function syncAnchorState() {
  const activeHash = isAdminDashboardPage() ? window.location.hash || "#adminOverview" : "";
  elements.adminAnchorLinks.forEach((link) => {
    const targetHash = link.getAttribute("href");
    link.classList.toggle("is-active", activeHash && targetHash === activeHash);
  });
}

function renderEmptyState(container, message) {
  container.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function showToast(message) {
  if (!elements.toast) {
    return;
  }

  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function loadAdminAccounts() {
  return loadStoredArray(adminAccountsStorageKey);
}

function loadAdminSession() {
  try {
    const savedValue = localStorage.getItem(adminSessionStorageKey);
    return savedValue ? JSON.parse(savedValue) : null;
  } catch (error) {
    return null;
  }
}

function loadStoredArray(storageKey) {
  try {
    const savedValue = localStorage.getItem(storageKey);
    const parsedValue = savedValue ? JSON.parse(savedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function persistStoredArray(storageKey, value) {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

function getCurrentPageName() {
  const pathParts = window.location.pathname.split("/");
  return pathParts[pathParts.length - 1] || "index.html";
}

function isAdminSignInPage() {
  return getCurrentPageName() === "admin-signin.html";
}

function isAdminDashboardPage() {
  return getCurrentPageName() === "admin-dashboard.html";
}

function normalizeIdentifier(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeEmail(value) {
  return normalizeIdentifier(value);
}

function normalizeUsername(value) {
  return normalizeIdentifier(value);
}

function formatHandle(value) {
  return value ? `@${value}` : "@account";
}

function formatAdminHandle(value) {
  return value ? `@${value}` : "@admin";
}

function formatSubmissionTime(value) {
  const parsedValue = value ? new Date(value) : null;
  if (!parsedValue || Number.isNaN(parsedValue.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedValue);
}

function compareDateDesc(left, right) {
  const leftValue = left ? new Date(left).getTime() : 0;
  const rightValue = right ? new Date(right).getTime() : 0;
  return rightValue - leftValue;
}

function getSupportStatusRank(status) {
  const normalized = normalizeIdentifier(status);
  if (normalized === "received") {
    return 0;
  }
  if (normalized === "in review") {
    return 1;
  }
  return 2;
}

function getVerificationStatusRank(status) {
  const normalized = normalizeIdentifier(status);
  if (normalized === "pending review") {
    return 0;
  }
  if (normalized === "approved") {
    return 1;
  }
  return 2;
}

function getMembershipPlanLabel(planKey) {
  return membershipPlans[planKey] || "Roadside Starter";
}

function formatPlatformLabel(platform, provider) {
  const platformLabel = platform === "mobile_app" ? "Mobile app" : "Web app";
  const providerLabel = provider && provider !== "email" ? ` via ${titleCase(provider)}` : "";
  return `${platformLabel}${providerLabel}`;
}

function titleCase(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
