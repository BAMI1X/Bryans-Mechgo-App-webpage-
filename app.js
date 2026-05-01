const mechanics = [
  {
    id: "m-101",
    name: "Marco's Mobile Auto",
    city: "Austin, TX",
    coordinates: { lat: 30.2711, lng: -97.7437 },
    baseCallout: 84,
    serviceRadiusMiles: 30,
    etaMinutes: 12,
    rating: 4.9,
    jobsCompleted: 486,
    distanceHint: "Local Austin coverage",
    availability: "Available now",
    urgency: ["emergency", "today", "scheduled"],
    specialties: ["battery", "diagnostic", "engine"],
    blurb: "Strong at no-start diagnostics, battery swaps, and electrical roadside saves.",
  },
  {
    id: "m-102",
    name: "Luna Roadside Garage",
    city: "Austin, TX",
    coordinates: { lat: 30.2555, lng: -97.7295 },
    baseCallout: 72,
    serviceRadiusMiles: 22,
    etaMinutes: 18,
    rating: 4.8,
    jobsCompleted: 311,
    distanceHint: "Central Austin coverage",
    availability: "Slots open this afternoon",
    urgency: ["today", "scheduled"],
    specialties: ["tire", "brakes", "diagnostic"],
    blurb: "Fast tire work and brake triage for drivers who can safely wait roadside.",
  },
  {
    id: "m-103",
    name: "Interstate Rescue Tech",
    city: "San Antonio, TX",
    coordinates: { lat: 29.4234, lng: -98.4938 },
    baseCallout: 96,
    serviceRadiusMiles: 38,
    etaMinutes: 15,
    rating: 5.0,
    jobsCompleted: 529,
    distanceHint: "Highway corridor coverage",
    availability: "Emergency crew on duty",
    urgency: ["emergency", "today"],
    specialties: ["battery", "tire", "diagnostic"],
    blurb: "Built for highway breakdowns with tools for jump starts, flats, and quick scans.",
  },
  {
    id: "m-104",
    name: "Copper Wrench Mobile",
    city: "Dallas, TX",
    coordinates: { lat: 32.7784, lng: -96.8002 },
    baseCallout: 108,
    serviceRadiusMiles: 34,
    etaMinutes: 24,
    rating: 4.7,
    jobsCompleted: 274,
    distanceHint: "North Dallas service zone",
    availability: "Best for scheduled same-day work",
    urgency: ["today", "scheduled"],
    specialties: ["engine", "brakes", "diagnostic"],
    blurb: "Ideal for deeper roadside troubleshooting when a small repair might avoid a tow.",
  },
  {
    id: "m-105",
    name: "Southbound Mechanic Co.",
    city: "Houston, TX",
    coordinates: { lat: 29.7597, lng: -95.3659 },
    baseCallout: 82,
    serviceRadiusMiles: 40,
    etaMinutes: 17,
    rating: 4.9,
    jobsCompleted: 418,
    distanceHint: "Houston metro coverage",
    availability: "Available now",
    urgency: ["emergency", "today", "scheduled"],
    specialties: ["battery", "tire", "brakes"],
    blurb: "High-volume roadside crew with strong response times in dense traffic corridors.",
  },
  {
    id: "m-106",
    name: "TrueNorth Auto Aid",
    city: "Austin, TX",
    coordinates: { lat: 30.3081, lng: -97.7264 },
    baseCallout: 68,
    serviceRadiusMiles: 20,
    etaMinutes: 28,
    rating: 4.8,
    jobsCompleted: 222,
    distanceHint: "North Austin diagnostic coverage",
    availability: "Scheduled diagnostic specialist",
    urgency: ["scheduled", "today"],
    specialties: ["diagnostic", "engine", "brakes"],
    blurb: "Best fit when travelers need an honest diagnosis before choosing tow versus repair.",
  },
];

const serviceProfiles = {
  battery: { label: "battery help", bookingLabel: "Battery service", laborBase: 28 },
  tire: { label: "tire repair", bookingLabel: "Tire repair", laborBase: 36 },
  brakes: { label: "brake support", bookingLabel: "Brake repair", laborBase: 58 },
  engine: { label: "engine trouble", bookingLabel: "Engine support", laborBase: 72 },
  diagnostic: { label: "diagnostic work", bookingLabel: "Diagnostic", laborBase: 32 },
};

const membershipPlans = {
  starter: "Roadside Starter",
  traveler: "Traveler Plus",
  priority: "Priority Family",
};

const paymentMethodTypes = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  applepay: "Apple Pay",
  googlepay: "Google Pay",
};

const payoutMethodTypes = {
  bank: "Bank transfer",
  debit: "Debit card",
  paypal: "PayPal",
  cashapp: "Cash App",
  zelle: "Zelle",
};

const timelineSteps = {
  emergency: ["Request received", "Mechanic assigned", "En route", "Roadside repair in progress"],
  today: ["Appointment confirmed", "Mechanic preparing", "Traveling to you", "Repair window active"],
  scheduled: ["Booking saved", "Reminder queued", "Mechanic confirmed", "Service window upcoming"],
};

const bookingStorageKey = "mechgo-bookings";
const verificationStorageKey = "mechgo-driver-verifications";
const searchStorageKey = "mechgo-search-state";
const customerProfilesStorageKey = "mechgo-customer-profiles";
const activeCustomerStorageKey = "mechgo-active-customer";
const mechanicProfilesStorageKey = "mechgo-mechanic-profiles";
const activeMechanicStorageKey = "mechgo-active-mechanic";
const authAccountsStorageKey = "mechgo-auth-accounts";
const authSessionStorageKey = "mechgo-auth-session";
const supportReportsStorageKey = "mechgo-support-reports";
const postAuthRedirectStorageKey = "mechgo-post-auth-redirect";
const gpsOptions = {
  enableHighAccuracy: true,
  timeout: 12000,
  maximumAge: 10000,
};
const geocodeApiBase = "https://geocoding-api.open-meteo.com/v1/search";
const weatherApiBase = "https://api.open-meteo.com/v1/forecast";
const weatherCacheTtlMs = 10 * 60 * 1000;

const geocodeCache = new Map();
const weatherCache = new Map();
const savedSearchState = loadSearchState();

const state = {
  city: savedSearchState.city || "Austin, TX",
  issue: savedSearchState.issue || "battery",
  urgency: savedSearchState.urgency || "emergency",
  userLocation: null,
  manualLocation: null,
  activeLocation: null,
  locationWatchId: null,
  locationError: "",
  weather: null,
  weatherStatus: "idle",
  weatherError: "",
  weatherLocationKey: "",
  selectedMechanic: null,
  environmentRequestId: 0,
  bookings: loadBookings(),
  driverVerifications: loadDriverVerifications(),
  customerProfiles: loadCustomerProfiles(),
  activeCustomerId: loadActiveCustomerId(),
  mechanicProfiles: loadMechanicProfiles(),
  activeMechanicId: loadActiveMechanicId(),
  authAccounts: loadAuthAccounts(),
  authSession: loadAuthSession(),
  supportReports: loadSupportReports(),
  postAuthRedirect: loadPostAuthRedirect(),
  bookingResumeHandled: false,
  authViewRole: "customer",
  authViewMode: "signin",
};

const elements = {
  quickRequestForm: document.querySelector("#quickRequestForm"),
  quickCity: document.querySelector("#quickCity"),
  quickIssue: document.querySelector("#quickIssue"),
  quickUrgency: document.querySelector("#quickUrgency"),
  filterForm: document.querySelector("#filterForm"),
  cityFilter: document.querySelector("#cityFilter"),
  issueFilter: document.querySelector("#issueFilter"),
  urgencyFilter: document.querySelector("#urgencyFilter"),
  locateUserButton: document.querySelector("#locateUserButton"),
  clearLocationButton: document.querySelector("#clearLocationButton"),
  driverVerificationForm: document.querySelector("#driverVerificationForm"),
  driverFullName: document.querySelector("#driverFullName"),
  driverEmail: document.querySelector("#driverEmail"),
  driverPhone: document.querySelector("#driverPhone"),
  driverVehicle: document.querySelector("#driverVehicle"),
  driverHomeCity: document.querySelector("#driverHomeCity"),
  licenseUpload: document.querySelector("#licenseUpload"),
  registrationUpload: document.querySelector("#registrationUpload"),
  insuranceUpload: document.querySelector("#insuranceUpload"),
  driverDocSummary: document.querySelector("#driverDocSummary"),
  verificationList: document.querySelector("#verificationList"),
  verificationCount: document.querySelector("#verificationCount"),
  termsTabs: Array.from(document.querySelectorAll("[data-terms-tab]")),
  termsPanels: Array.from(document.querySelectorAll("[data-terms-panel]")),
  locationStatus: document.querySelector("#locationStatus"),
  locationMeta: document.querySelector("#locationMeta"),
  pricingSignal: document.querySelector("#pricingSignal"),
  locationModeBadge: document.querySelector("#locationModeBadge"),
  commandCenterMode: document.querySelector("#commandCenterMode"),
  commandCenterWeather: document.querySelector("#commandCenterWeather"),
  commandCenterCoverage: document.querySelector("#commandCenterCoverage"),
  commandCenterTempo: document.querySelector("#commandCenterTempo"),
  mechanicGrid: document.querySelector("#mechanicGrid"),
  resultsSummary: document.querySelector("#resultsSummary"),
  bookingList: document.querySelector("#bookingList"),
  bookingCount: document.querySelector("#bookingCount"),
  bookingModal: document.querySelector("#bookingModal"),
  closeModalButton: document.querySelector("#closeModalButton"),
  bookingForm: document.querySelector("#bookingForm"),
  bookingTitle: document.querySelector("#bookingTitle"),
  bookingSubtitle: document.querySelector("#bookingSubtitle"),
  bookingSummary: document.querySelector("#bookingSummary"),
  selectedMechanicId: document.querySelector("#selectedMechanicId"),
  serviceType: document.querySelector("#serviceType"),
  breakdownLocation: document.querySelector("#breakdownLocation"),
  repairNotes: document.querySelector("#repairNotes"),
  customerName: document.querySelector("#customerName"),
  customerPhone: document.querySelector("#customerPhone"),
  vehicleInfo: document.querySelector("#vehicleInfo"),
  toast: document.querySelector("#toast"),
  mechanicTemplate: document.querySelector("#mechanicCardTemplate"),
  bookingTemplate: document.querySelector("#bookingCardTemplate"),
  verificationTemplate: document.querySelector("#verificationCardTemplate"),
  customerProfileForm: document.querySelector("#customerProfileForm"),
  registeredCustomerId: document.querySelector("#registeredCustomerId"),
  accountFullName: document.querySelector("#accountFullName"),
  accountUsername: document.querySelector("#accountUsername"),
  accountEmail: document.querySelector("#accountEmail"),
  accountPhone: document.querySelector("#accountPhone"),
  accountHomeCity: document.querySelector("#accountHomeCity"),
  accountAddress: document.querySelector("#accountAddress"),
  accountPreferredContact: document.querySelector("#accountPreferredContact"),
  accountVehicle: document.querySelector("#accountVehicle"),
  accountSecondaryVehicle: document.querySelector("#accountSecondaryVehicle"),
  accountPlateNumber: document.querySelector("#accountPlateNumber"),
  accountRoadsideNotes: document.querySelector("#accountRoadsideNotes"),
  accountTier: document.querySelector("#accountTier"),
  accountServicePreference: document.querySelector("#accountServicePreference"),
  customerFormModeLabel: document.querySelector("#customerFormModeLabel"),
  customerProfileSubmitButton: document.querySelector("#customerProfileSubmitButton"),
  customerDirectory: document.querySelector("#customerDirectory"),
  customerCount: document.querySelector("#customerCount"),
  customerTemplate: document.querySelector("#customerCardTemplate"),
  activeCustomerName: document.querySelector("#activeCustomerName"),
  activeCustomerHandle: document.querySelector("#activeCustomerHandle"),
  activeCustomerSummary: document.querySelector("#activeCustomerSummary"),
  activeCustomerHome: document.querySelector("#activeCustomerHome"),
  activeCustomerVehicle: document.querySelector("#activeCustomerVehicle"),
  activeCustomerPaymentDefault: document.querySelector("#activeCustomerPaymentDefault"),
  activeCustomerPlan: document.querySelector("#activeCustomerPlan"),
  activeCustomerContact: document.querySelector("#activeCustomerContact"),
  customerAccountBadge: document.querySelector("#customerAccountBadge"),
  paymentMethodForm: document.querySelector("#paymentMethodForm"),
  paymentMethodType: document.querySelector("#paymentMethodType"),
  paymentMethodLabel: document.querySelector("#paymentMethodLabel"),
  paymentMethodLastFour: document.querySelector("#paymentMethodLastFour"),
  paymentMethodExpiry: document.querySelector("#paymentMethodExpiry"),
  paymentMethodZip: document.querySelector("#paymentMethodZip"),
  paymentMethodDefault: document.querySelector("#paymentMethodDefault"),
  paymentMethodList: document.querySelector("#paymentMethodList"),
  paymentMethodCount: document.querySelector("#paymentMethodCount"),
  paymentCustomerTag: document.querySelector("#paymentCustomerTag"),
  paymentHint: document.querySelector("#paymentHint"),
  paymentTemplate: document.querySelector("#paymentMethodTemplate"),
  mechanicProfileForm: document.querySelector("#mechanicProfileForm"),
  registeredMechanicId: document.querySelector("#registeredMechanicId"),
  mechanicBusinessName: document.querySelector("#mechanicBusinessName"),
  mechanicUsername: document.querySelector("#mechanicUsername"),
  mechanicLeadName: document.querySelector("#mechanicLeadName"),
  mechanicEmail: document.querySelector("#mechanicEmail"),
  mechanicPhone: document.querySelector("#mechanicPhone"),
  mechanicBaseCity: document.querySelector("#mechanicBaseCity"),
  mechanicBaseAddress: document.querySelector("#mechanicBaseAddress"),
  mechanicServiceRadius: document.querySelector("#mechanicServiceRadius"),
  mechanicBaseCallout: document.querySelector("#mechanicBaseCallout"),
  mechanicEtaMinutes: document.querySelector("#mechanicEtaMinutes"),
  mechanicJobsCompleted: document.querySelector("#mechanicJobsCompleted"),
  mechanicDispatchMode: document.querySelector("#mechanicDispatchMode"),
  mechanicServiceVehicle: document.querySelector("#mechanicServiceVehicle"),
  mechanicCredentialStatus: document.querySelector("#mechanicCredentialStatus"),
  mechanicCoverageNotes: document.querySelector("#mechanicCoverageNotes"),
  mechanicBio: document.querySelector("#mechanicBio"),
  mechanicFormModeLabel: document.querySelector("#mechanicFormModeLabel"),
  mechanicProfileSubmitButton: document.querySelector("#mechanicProfileSubmitButton"),
  mechanicDirectory: document.querySelector("#mechanicDirectory"),
  mechanicCount: document.querySelector("#mechanicCount"),
  mechanicProfileTemplate: document.querySelector("#registeredMechanicTemplate"),
  activeMechanicName: document.querySelector("#activeMechanicName"),
  activeMechanicHandle: document.querySelector("#activeMechanicHandle"),
  activeMechanicSummary: document.querySelector("#activeMechanicSummary"),
  activeMechanicCity: document.querySelector("#activeMechanicCity"),
  activeMechanicRadius: document.querySelector("#activeMechanicRadius"),
  activeMechanicPricing: document.querySelector("#activeMechanicPricing"),
  activeMechanicPayoutDefault: document.querySelector("#activeMechanicPayoutDefault"),
  activeMechanicMode: document.querySelector("#activeMechanicMode"),
  activeMechanicContact: document.querySelector("#activeMechanicContact"),
  mechanicAccountBadge: document.querySelector("#mechanicAccountBadge"),
  mechanicSpecialties: Array.from(document.querySelectorAll("[data-mechanic-specialty]")),
  payoutMethodForm: document.querySelector("#payoutMethodForm"),
  payoutMethodType: document.querySelector("#payoutMethodType"),
  payoutMethodLabel: document.querySelector("#payoutMethodLabel"),
  payoutMethodLastFour: document.querySelector("#payoutMethodLastFour"),
  payoutMethodFrequency: document.querySelector("#payoutMethodFrequency"),
  payoutMethodDefault: document.querySelector("#payoutMethodDefault"),
  payoutMethodList: document.querySelector("#payoutMethodList"),
  payoutMethodCount: document.querySelector("#payoutMethodCount"),
  payoutMechanicTag: document.querySelector("#payoutMechanicTag"),
  payoutHint: document.querySelector("#payoutHint"),
  payoutTemplate: document.querySelector("#payoutMethodTemplate"),
  customerSignInForm: document.querySelector("#customerSignInForm"),
  customerSignInIdentifier: document.querySelector("#customerSignInIdentifier"),
  customerSignInPassword: document.querySelector("#customerSignInPassword"),
  customerCreateForm: document.querySelector("#customerCreateForm"),
  createCustomerFullName: document.querySelector("#createCustomerFullName"),
  createCustomerUsername: document.querySelector("#createCustomerUsername"),
  createCustomerEmail: document.querySelector("#createCustomerEmail"),
  createCustomerPhone: document.querySelector("#createCustomerPhone"),
  createCustomerHomeCity: document.querySelector("#createCustomerHomeCity"),
  createCustomerVehicle: document.querySelector("#createCustomerVehicle"),
  createCustomerPassword: document.querySelector("#createCustomerPassword"),
  createCustomerPasswordConfirm: document.querySelector("#createCustomerPasswordConfirm"),
  mechanicSignInForm: document.querySelector("#mechanicSignInForm"),
  mechanicSignInIdentifier: document.querySelector("#mechanicSignInIdentifier"),
  mechanicSignInPassword: document.querySelector("#mechanicSignInPassword"),
  mechanicCreateForm: document.querySelector("#mechanicCreateForm"),
  createMechanicBusinessName: document.querySelector("#createMechanicBusinessName"),
  createMechanicUsername: document.querySelector("#createMechanicUsername"),
  createMechanicLeadName: document.querySelector("#createMechanicLeadName"),
  createMechanicEmail: document.querySelector("#createMechanicEmail"),
  createMechanicPhone: document.querySelector("#createMechanicPhone"),
  createMechanicBaseCity: document.querySelector("#createMechanicBaseCity"),
  createMechanicPrimaryService: document.querySelector("#createMechanicPrimaryService"),
  createMechanicPassword: document.querySelector("#createMechanicPassword"),
  createMechanicPasswordConfirm: document.querySelector("#createMechanicPasswordConfirm"),
  authRoleTabs: Array.from(document.querySelectorAll("[data-auth-role-tab]")),
  authModeTabs: Array.from(document.querySelectorAll("[data-auth-mode-tab]")),
  authPanels: Array.from(document.querySelectorAll("[data-auth-panel]")),
  sessionStatus: document.querySelector("#sessionStatus"),
  sessionName: document.querySelector("#sessionName"),
  sessionMeta: document.querySelector("#sessionMeta"),
  sessionDestinationLink: document.querySelector("#sessionDestinationLink"),
  signOutButton: document.querySelector("#signOutButton"),
  customerAccountCount: document.querySelector("#customerAccountCount"),
  mechanicAccountCount: document.querySelector("#mechanicAccountCount"),
  sessionRoleLabel: document.querySelector("#sessionRoleLabel"),
  sessionCoverageLabel: document.querySelector("#sessionCoverageLabel"),
  dashboardGreeting: document.querySelector("#dashboardGreeting"),
  dashboardSessionMeta: document.querySelector("#dashboardSessionMeta"),
  dashboardRoleBadge: document.querySelector("#dashboardRoleBadge"),
  dashboardPendingNotice: document.querySelector("#dashboardPendingNotice"),
  dashboardContinueLink: document.querySelector("#dashboardContinueLink"),
  dashboardAccountHandle: document.querySelector("#dashboardAccountHandle"),
  dashboardAccountEmail: document.querySelector("#dashboardAccountEmail"),
  dashboardAccountMeta: document.querySelector("#dashboardAccountMeta"),
  dashboardThemeStatus: document.querySelector("#dashboardThemeStatus"),
  dashboardThemeToggle: document.querySelector("#dashboardThemeToggle"),
  dashboardCustomerStatus: document.querySelector("#dashboardCustomerStatus"),
  dashboardCustomerName: document.querySelector("#dashboardCustomerName"),
  dashboardCustomerMeta: document.querySelector("#dashboardCustomerMeta"),
  dashboardCustomerLink: document.querySelector("#dashboardCustomerLink"),
  dashboardMechanicStatus: document.querySelector("#dashboardMechanicStatus"),
  dashboardMechanicName: document.querySelector("#dashboardMechanicName"),
  dashboardMechanicMeta: document.querySelector("#dashboardMechanicMeta"),
  dashboardMechanicLink: document.querySelector("#dashboardMechanicLink"),
  settingsForm: document.querySelector("#settingsForm"),
  settingsDisplayName: document.querySelector("#settingsDisplayName"),
  settingsRoleSummary: document.querySelector("#settingsRoleSummary"),
  settingsUsername: document.querySelector("#settingsUsername"),
  settingsPrimaryEmail: document.querySelector("#settingsPrimaryEmail"),
  settingsPrimaryPhone: document.querySelector("#settingsPrimaryPhone"),
  settingsEmailStatus: document.querySelector("#settingsEmailStatus"),
  settingsPhoneStatus: document.querySelector("#settingsPhoneStatus"),
  settingsSecurityStatus: document.querySelector("#settingsSecurityStatus"),
  settingsSharingStatus: document.querySelector("#settingsSharingStatus"),
  settingsRecoveryEmail: document.querySelector("#settingsRecoveryEmail"),
  settingsEmergencyContact: document.querySelector("#settingsEmergencyContact"),
  settingsThemeMode: document.querySelector("#settingsThemeMode"),
  settingsTwoFactor: document.querySelector("#settingsTwoFactor"),
  settingsLocationSharing: document.querySelector("#settingsLocationSharing"),
  settingsSmsAlerts: document.querySelector("#settingsSmsAlerts"),
  settingsEmailReceipts: document.querySelector("#settingsEmailReceipts"),
  settingsMarketing: document.querySelector("#settingsMarketing"),
  emailChangeForm: document.querySelector("#emailChangeForm"),
  settingsNewEmail: document.querySelector("#settingsNewEmail"),
  settingsConfirmEmail: document.querySelector("#settingsConfirmEmail"),
  passwordChangeForm: document.querySelector("#passwordChangeForm"),
  settingsCurrentPassword: document.querySelector("#settingsCurrentPassword"),
  settingsNewPassword: document.querySelector("#settingsNewPassword"),
  settingsConfirmPassword: document.querySelector("#settingsConfirmPassword"),
  settingsSignOutButton: document.querySelector("#settingsSignOutButton"),
  verifyEmailButton: document.querySelector("#verifyEmailButton"),
  verifyPhoneButton: document.querySelector("#verifyPhoneButton"),
  problemReportForm: document.querySelector("#problemReportForm"),
  reportName: document.querySelector("#reportName"),
  reportEmail: document.querySelector("#reportEmail"),
  reportUserType: document.querySelector("#reportUserType"),
  reportCategory: document.querySelector("#reportCategory"),
  reportSubject: document.querySelector("#reportSubject"),
  reportBookingId: document.querySelector("#reportBookingId"),
  reportSeverity: document.querySelector("#reportSeverity"),
  reportDescription: document.querySelector("#reportDescription"),
  reportContactMethod: document.querySelector("#reportContactMethod"),
  reportList: document.querySelector("#reportList"),
  reportCount: document.querySelector("#reportCount"),
  reportTemplate: document.querySelector("#reportCardTemplate"),
  legalOpenButtons: Array.from(document.querySelectorAll("[data-legal-open]")),
  legalModal: document.querySelector("#legalModal"),
  closeLegalModalButton: document.querySelector("#closeLegalModalButton"),
  legalModalTitle: document.querySelector("#legalModalTitle"),
  legalModalBody: document.querySelector("#legalModalBody"),
  profileTabs: Array.from(document.querySelectorAll("[data-profile-tab]")),
  profilePanels: Array.from(document.querySelectorAll("[data-profile-panel]")),
  authLinks: Array.from(document.querySelectorAll("[data-auth-link]")),
  navLinks: Array.from(document.querySelectorAll("[data-nav-link]")),
  overviewTabs: Array.from(document.querySelectorAll("[data-overview-tab]")),
  overviewPanels: Array.from(document.querySelectorAll("[data-overview-panel]")),
};

initialize();

function initialize() {
  synchronizeActiveCustomerSelection();
  synchronizeActiveMechanicSelection();
  synchronizeAuthSession();
  applyActiveAccountTheme();

  if (enforcePageAccess()) {
    return;
  }

  reconcilePostAuthRedirect();

  if (elements.cityFilter) {
    elements.cityFilter.value = state.city;
  }
  if (elements.issueFilter) {
    elements.issueFilter.value = state.issue;
  }
  if (elements.urgencyFilter) {
    elements.urgencyFilter.value = state.urgency;
  }
  if (elements.driverHomeCity) {
    elements.driverHomeCity.value = state.city;
  }
  if (elements.accountHomeCity) {
    elements.accountHomeCity.value = state.city;
  }
  if (elements.mechanicBaseCity) {
    elements.mechanicBaseCity.value = state.city;
  }
  syncAuthCreateDefaults();
  syncQuickRequestInputs();
  syncCustomerProfileForm();
  syncMechanicProfileForm();
  if (elements.mechanicSpecialties.length && !elements.registeredMechanicId?.value) {
    syncMechanicSpecialtyInputs(["battery", "diagnostic"]);
  }

  if (elements.quickRequestForm) {
    elements.quickRequestForm.addEventListener("submit", handleQuickRequest);
  }
  if (elements.filterForm) {
    elements.filterForm.addEventListener("submit", handleFilterSubmit);
  }
  if (elements.locateUserButton) {
    elements.locateUserButton.addEventListener("click", handleLocateUser);
  }
  if (elements.clearLocationButton) {
    elements.clearLocationButton.addEventListener("click", stopLocationTracking);
  }
  if (elements.driverVerificationForm) {
    elements.driverVerificationForm.addEventListener("submit", handleDriverVerificationSubmit);
  }
  if (elements.licenseUpload) {
    elements.licenseUpload.addEventListener("change", updateDriverDocSummary);
  }
  if (elements.registrationUpload) {
    elements.registrationUpload.addEventListener("change", updateDriverDocSummary);
  }
  if (elements.insuranceUpload) {
    elements.insuranceUpload.addEventListener("change", updateDriverDocSummary);
  }
  if (elements.customerProfileForm) {
    elements.customerProfileForm.addEventListener("submit", handleCustomerProfileSubmit);
  }
  if (elements.paymentMethodForm) {
    elements.paymentMethodForm.addEventListener("submit", handlePaymentMethodSubmit);
  }
  if (elements.mechanicProfileForm) {
    elements.mechanicProfileForm.addEventListener("submit", handleMechanicProfileSubmit);
  }
  if (elements.payoutMethodForm) {
    elements.payoutMethodForm.addEventListener("submit", handlePayoutMethodSubmit);
  }
  if (elements.customerSignInForm) {
    elements.customerSignInForm.addEventListener("submit", handleCustomerSignInSubmit);
  }
  if (elements.mechanicSignInForm) {
    elements.mechanicSignInForm.addEventListener("submit", handleMechanicSignInSubmit);
  }
  if (elements.customerCreateForm) {
    elements.customerCreateForm.addEventListener("submit", handleCustomerAccountCreate);
  }
  if (elements.mechanicCreateForm) {
    elements.mechanicCreateForm.addEventListener("submit", handleMechanicAccountCreate);
  }
  if (elements.signOutButton) {
    elements.signOutButton.addEventListener("click", handleSignOut);
  }
  if (elements.settingsSignOutButton) {
    elements.settingsSignOutButton.addEventListener("click", handleSignOut);
  }
  if (elements.dashboardThemeToggle) {
    elements.dashboardThemeToggle.addEventListener("click", handleDashboardThemeToggle);
  }
  if (elements.settingsForm) {
    elements.settingsForm.addEventListener("submit", handleSettingsSubmit);
  }
  if (elements.emailChangeForm) {
    elements.emailChangeForm.addEventListener("submit", handleEmailChangeSubmit);
  }
  if (elements.passwordChangeForm) {
    elements.passwordChangeForm.addEventListener("submit", handlePasswordChangeSubmit);
  }
  if (elements.verifyEmailButton) {
    elements.verifyEmailButton.addEventListener("click", handleVerifyEmail);
  }
  if (elements.verifyPhoneButton) {
    elements.verifyPhoneButton.addEventListener("click", handleVerifyPhone);
  }
  if (elements.problemReportForm) {
    elements.problemReportForm.addEventListener("submit", handleProblemReportSubmit);
  }
  initializeTermsTabs();
  initializeOverviewTabs();
  initializeAuthTabs();
  initializeProfileTabs();
  initializeLegalReader();
  if (elements.serviceType) {
    elements.serviceType.addEventListener("change", handleServiceTypeChange);
  }
  if (elements.bookingForm) {
    elements.bookingForm.addEventListener("submit", handleBookingSubmit);
  }
  if (elements.closeModalButton) {
    elements.closeModalButton.addEventListener("click", closeModal);
  }
  if (elements.bookingModal) {
    elements.bookingModal.addEventListener("click", handleModalBackdrop);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      closeLegalModal();
    }
  });

  initializeExperienceLayer();
  if (elements.driverDocSummary) {
    updateDriverDocSummary();
  }
  if (hasLocationPanel()) {
    updateLocationPanel();
  }
  if (elements.mechanicGrid || hasCommandCenter()) {
    renderMechanics();
    resumePendingBookingIfNeeded();
  }
  if (elements.bookingList) {
    renderBookings();
  }
  if (elements.verificationList) {
    renderDriverVerifications();
  }
  if (hasCustomerWorkspace()) {
    renderCustomerWorkspace();
  }
  if (hasMechanicWorkspace()) {
    renderMechanicWorkspace();
  }
  if (hasAuthWorkspace()) {
    renderAuthWorkspace();
  }
  if (hasSupportWorkspace()) {
    renderSupportWorkspace();
  }
  if (hasDashboard()) {
    renderDashboard();
  }
  if (hasSettingsWorkspace()) {
    renderSettingsWorkspace();
  }
  renderAuthNav();
  if (shouldLoadEnvironment()) {
    void refreshEnvironment();
  }
}

let revealObserver = null;

function initializeExperienceLayer() {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("pointermove", handlePointerGlow, { passive: true });
  }

  setupRevealObserver();
  refreshInteractiveSurfaces();
  updateActiveNavLink();
}

function initializeTermsTabs() {
  if (!elements.termsTabs.length || !elements.termsPanels.length) {
    return;
  }

  elements.termsTabs.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      setActiveTermsTab(tabButton.dataset.termsTab || "");
    });
  });

  const initialTab = elements.termsTabs.find((tabButton) => tabButton.classList.contains("is-active"));
  setActiveTermsTab(initialTab ? initialTab.dataset.termsTab || "tos" : "tos");
}

function initializeOverviewTabs() {
  if (!elements.overviewTabs.length || !elements.overviewPanels.length) {
    return;
  }

  elements.overviewTabs.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      setActiveOverviewTab(tabButton.dataset.overviewTab || "");
    });
  });

  const initialTab = elements.overviewTabs.find((tabButton) => tabButton.classList.contains("is-active"));
  setActiveOverviewTab(initialTab ? initialTab.dataset.overviewTab || "marketplace" : "marketplace");
}

function setActiveOverviewTab(tabName) {
  elements.overviewTabs.forEach((tabButton) => {
    const isActive = tabButton.dataset.overviewTab === tabName;
    tabButton.classList.toggle("is-active", isActive);
    tabButton.setAttribute("aria-selected", String(isActive));
  });

  elements.overviewPanels.forEach((panel) => {
    const isActive = panel.dataset.overviewPanel === tabName;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

function setActiveTermsTab(tabName) {
  elements.termsTabs.forEach((tabButton) => {
    const isActive = tabButton.dataset.termsTab === tabName;
    tabButton.classList.toggle("is-active", isActive);
    tabButton.setAttribute("aria-selected", String(isActive));
  });

  elements.termsPanels.forEach((panel) => {
    const isActive = panel.dataset.termsPanel === tabName;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

function initializeAuthTabs() {
  if (!elements.authRoleTabs.length || !elements.authModeTabs.length || !elements.authPanels.length) {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const requestedRole = searchParams.get("role");
  const requestedMode = searchParams.get("mode");

  elements.authRoleTabs.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      setActiveAuthRole(tabButton.dataset.authRoleTab || "customer");
    });
  });

  elements.authModeTabs.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      setActiveAuthMode(tabButton.dataset.authModeTab || "signin");
    });
  });

  const defaultRole = requestedRole === "mechanic"
    ? "mechanic"
    : requestedRole === "customer"
      ? "customer"
      : state.authSession && state.authSession.role === "mechanic"
        ? "mechanic"
        : "customer";
  setActiveAuthRole(defaultRole);
  setActiveAuthMode(requestedMode === "create" ? "create" : "signin");
}

function setActiveAuthRole(role) {
  state.authViewRole = role === "mechanic" ? "mechanic" : "customer";
  syncAuthPanels();
}

function setActiveAuthMode(mode) {
  state.authViewMode = mode === "create" ? "create" : "signin";
  syncAuthPanels();
}

function syncAuthPanels() {
  elements.authRoleTabs.forEach((tabButton) => {
    const isActive = tabButton.dataset.authRoleTab === state.authViewRole;
    tabButton.classList.toggle("is-active", isActive);
    tabButton.setAttribute("aria-selected", String(isActive));
  });

  elements.authModeTabs.forEach((tabButton) => {
    const isActive = tabButton.dataset.authModeTab === state.authViewMode;
    tabButton.classList.toggle("is-active", isActive);
    tabButton.setAttribute("aria-selected", String(isActive));
  });

  elements.authPanels.forEach((panel) => {
    const isActive =
      panel.dataset.authRole === state.authViewRole &&
      panel.dataset.authMode === state.authViewMode;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  syncAuthCreateDefaults();
}

function initializeProfileTabs() {
  if (!elements.profileTabs.length || !elements.profilePanels.length) {
    return;
  }

  const groupedTabs = new Map();
  elements.profileTabs.forEach((tabButton) => {
    const groupName = tabButton.dataset.profileGroup || "";
    if (!groupName) {
      return;
    }

    if (!groupedTabs.has(groupName)) {
      groupedTabs.set(groupName, []);
    }

    groupedTabs.get(groupName).push(tabButton);
    tabButton.addEventListener("click", () => {
      setActiveProfileTab(groupName, tabButton.dataset.profileTab || "");
    });
  });

  groupedTabs.forEach((groupTabs, groupName) => {
    const initialTab = groupTabs.find((tabButton) => tabButton.classList.contains("is-active"));
    const defaultTab = initialTab ? initialTab.dataset.profileTab || "" : groupTabs[0].dataset.profileTab || "";
    setActiveProfileTab(groupName, defaultTab);
  });
}

function setActiveProfileTab(groupName, tabName) {
  elements.profileTabs
    .filter((tabButton) => tabButton.dataset.profileGroup === groupName)
    .forEach((tabButton) => {
      const isActive = tabButton.dataset.profileTab === tabName;
      tabButton.classList.toggle("is-active", isActive);
      tabButton.setAttribute("aria-selected", String(isActive));
    });

  elements.profilePanels
    .filter((panel) => panel.dataset.profileGroup === groupName)
    .forEach((panel) => {
      const isActive = panel.dataset.profilePanel === tabName;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
}

function initializeLegalReader() {
  if (!elements.legalOpenButtons.length) {
    return;
  }

  elements.legalOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openLegalModal(button.dataset.legalOpen || "");
    });
  });

  if (elements.closeLegalModalButton) {
    elements.closeLegalModalButton.addEventListener("click", closeLegalModal);
  }

  if (elements.legalModal) {
    elements.legalModal.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
        closeLegalModal();
      }
    });
  }
}

function setupRevealObserver() {
  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    revealObserver = null;
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    }
  );
}

function refreshInteractiveSurfaces() {
  const surfaceSelector = [
    ".quick-request-card",
    ".hero-console",
    ".trust-strip article",
    ".service-card",
    ".filter-panel",
    ".results-panel",
    ".mechanic-card",
    ".how-grid article",
    ".verification-panel",
    ".terms-summary",
    ".terms-panel",
    ".dispatch-column",
    ".booking-card",
    ".verification-card",
  ].join(", ");

  const revealSelector = [
    ".hero-copy",
    ".section-copy",
    ".results-bar",
  ].join(", ");

  document.querySelectorAll(surfaceSelector).forEach((element) => {
    prepareInteractiveSurface(element);
  });
  document.querySelectorAll("[data-interactive-surface]").forEach((element) => {
    prepareInteractiveSurface(element);
  });
  document.querySelectorAll(revealSelector).forEach((element) => {
    prepareRevealTarget(element);
  });
  document.querySelectorAll("[data-reveal]").forEach((element) => {
    prepareRevealTarget(element);
  });
}

function prepareInteractiveSurface(element) {
  element.classList.add("interactive-surface", "reveal-on-scroll");
  bindSurfaceTilt(element);
  prepareRevealTarget(element);
}

function prepareRevealTarget(element) {
  element.classList.add("reveal-on-scroll");

  if (!revealObserver) {
    element.classList.add("is-visible");
    return;
  }

  if (element.dataset.revealBound === "true") {
    return;
  }

  element.dataset.revealBound = "true";
  revealObserver.observe(element);
}

function bindSurfaceTilt(element) {
  if (
    element.dataset.tiltBound === "true" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  element.dataset.tiltBound = "true";

  element.addEventListener("pointermove", (event) => {
    const bounds = element.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width;
    const pointerY = (event.clientY - bounds.top) / bounds.height;
    const tiltY = (pointerX - 0.5) * 8;
    const tiltX = (0.5 - pointerY) * 8;

    element.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    element.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    element.style.setProperty("--shine-x", `${(pointerX * 100).toFixed(2)}%`);
    element.style.setProperty("--shine-y", `${(pointerY * 100).toFixed(2)}%`);
  });

  element.addEventListener("pointerleave", () => {
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--shine-x", "20%");
    element.style.setProperty("--shine-y", "0%");
  });
}

function handlePointerGlow(event) {
  const pointerX = (event.clientX / window.innerWidth) * 100;
  const pointerY = (event.clientY / window.innerHeight) * 100;

  document.documentElement.style.setProperty("--pointer-x", `${pointerX.toFixed(2)}%`);
  document.documentElement.style.setProperty("--pointer-y", `${pointerY.toFixed(2)}%`);
}

function updateActiveNavLink() {
  if (!elements.navLinks.length) {
    return;
  }

  const currentPageName = getCurrentPageName();

  elements.navLinks.forEach((link) => {
    const isActive = getLinkedPageName(link.getAttribute("href")) === currentPageName;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function enforcePageAccess() {
  const currentPageName = getCurrentPageName();
  const activeAccount = getActiveAuthAccount();

  if (!isProtectedPage(currentPageName)) {
    return false;
  }

  if (!activeAccount) {
    state.postAuthRedirect = {
      path: currentPageName,
      reason: "restricted",
      requestedAt: new Date().toISOString(),
    };
    persistPostAuthRedirect();
    window.location.href = getSignInRedirectForPage(currentPageName);
    return true;
  }

  if (isMechanicOnlyPage(currentPageName) && activeAccount.role !== "mechanic") {
    state.postAuthRedirect = {
      path: "mechanics.html",
      reason: "mechanic-only",
      requestedAt: new Date().toISOString(),
    };
    persistPostAuthRedirect();
    window.location.href = "dashboard.html";
    return true;
  }

  return false;
}

function isProtectedPage(pageName) {
  return new Set([
    "dashboard.html",
    "marketplace.html",
    "dispatch.html",
    "customers.html",
    "mechanics.html",
    "verification.html",
    "settings.html",
  ]).has(pageName);
}

function isMechanicOnlyPage(pageName) {
  return new Set(["verification.html"]).has(pageName);
}

function getSignInRedirectForPage(pageName) {
  if (pageName === "customers.html") {
    return "signin.html?role=customer&mode=create";
  }

  if (pageName === "mechanics.html" || pageName === "verification.html") {
    return "signin.html?role=mechanic&mode=create";
  }

  return "signin.html";
}

function getPostSignInDestination(account) {
  const pendingRedirect = state.postAuthRedirect || loadPostAuthRedirect();

  if (pendingRedirect) {
    if (pendingRedirect.reason === "booking" && account.role === "customer") {
      return "marketplace.html#marketplace";
    }

    if (pendingRedirect.reason === "mechanic-only") {
      return account.role === "mechanic" ? "mechanics.html" : "dashboard.html";
    }

    if (pendingRedirect.reason === "restricted" && pendingRedirect.path) {
      return pendingRedirect.path;
    }
  }

  return account.role === "customer" ? "marketplace.html#marketplace" : "dashboard.html";
}

function getThemeModeLabel(themeMode) {
  return themeMode === "light" ? "Light mode" : "Dark mode";
}

function applyThemeMode(themeMode) {
  if (!document.body) {
    return;
  }

  document.body.dataset.theme = themeMode === "light" ? "light" : "dark";
  document.documentElement.style.colorScheme = themeMode === "light" ? "light" : "dark";
}

function applyActiveAccountTheme() {
  const activeAccount = getActiveAuthAccount();
  const themeMode = activeAccount ? getNormalizedAccountSettings(activeAccount).themeMode : "dark";
  applyThemeMode(themeMode);
}

function renderAuthNav() {
  if (!elements.authLinks.length) {
    return;
  }

  const activeAccount = getActiveAuthAccount();

  elements.authLinks.forEach((link) => {
    if (activeAccount) {
      link.setAttribute("href", "dashboard.html");
      link.textContent = formatSignedInLabel(activeAccount);
      link.classList.add("is-signed-in");
      link.setAttribute(
        "aria-label",
        `Signed in as ${activeAccount.role} ${formatSignedInLabel(activeAccount)}`
      );
      link.setAttribute(
        "title",
        `Signed in as ${activeAccount.role === "customer" ? "customer" : "mechanic"} ${
          activeAccount.displayName || formatSignedInLabel(activeAccount)
        }`
      );
      return;
    }

    link.setAttribute("href", "signin.html");
    link.textContent = "Sign in";
    link.classList.remove("is-signed-in");
    link.setAttribute("aria-label", "Sign in or create a MechGo account");
    link.setAttribute("title", "Sign in or create a MechGo account");
  });

  updateActiveNavLink();
}

function updateHeroCommandCenter(matchCount) {
  if (!hasCommandCenter()) {
    return;
  }

  const resolvedMatchCount = typeof matchCount === "number" ? matchCount : getFilteredMechanics().length;
  const pricingContext = getPricingContext();
  const modeLabel = state.userLocation
    ? "GPS priority routing"
    : state.activeLocation
      ? "City weather pricing"
      : "Manual search routing";
  const weatherLabel =
    state.weatherStatus === "loading"
      ? "Syncing live weather"
      : state.weather
        ? `${Math.round(state.weather.temperature)}F | ${Math.round(state.weather.windSpeed)} mph wind`
        : state.weatherError
          ? "Weather fallback mode"
          : "Waiting on environment";

  elements.commandCenterMode.textContent = modeLabel;
  elements.commandCenterWeather.textContent = weatherLabel;
  elements.commandCenterCoverage.textContent = `${resolvedMatchCount} mechanic${
    resolvedMatchCount === 1 ? "" : "s"
  } matched`;
  elements.commandCenterTempo.textContent = pricingContext.time.description;
}

function handleQuickRequest(event) {
  event.preventDefault();

  state.city = elements.quickCity.value.trim() || "Austin, TX";
  state.issue = elements.quickIssue.value;
  state.urgency = elements.quickUrgency.value;
  persistSearchState();

  syncFiltersToState();
  clearManualPricingContextIfNeeded();
  if (!elements.mechanicGrid) {
    window.location.href = "marketplace.html";
    return;
  }

  renderMechanics();
  void refreshEnvironment();
  showToast(
    state.userLocation
      ? "Nearby mechanics updated using your live GPS position."
      : "Nearby mechanics updated for your roadside request."
  );
}

function handleFilterSubmit(event) {
  event.preventDefault();

  state.city = elements.cityFilter.value.trim();
  state.issue = elements.issueFilter.value;
  state.urgency = elements.urgencyFilter.value;
  persistSearchState();

  syncQuickRequestInputs();

  clearManualPricingContextIfNeeded();
  renderMechanics();
  void refreshEnvironment();
  showToast(
    state.userLocation
      ? "Matches refreshed and sorted by live GPS distance."
      : "Mechanic matches refreshed."
  );
}

function handleLocateUser() {
  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  if (!window.isSecureContext && !isLocalhost) {
    state.locationError = "GPS usually needs localhost or HTTPS in the browser.";
    updateLocationPanel();
    showToast("Open MechGo on localhost or HTTPS to enable GPS.");
    return;
  }

  if (!("geolocation" in navigator)) {
    state.locationError = "GPS is not supported in this browser.";
    updateLocationPanel();
    showToast("This browser does not support GPS location.");
    return;
  }

  state.locationError = "";
  updateLocationPanel("Requesting your GPS location...");

  if (state.locationWatchId === null) {
    state.locationWatchId = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      gpsOptions
    );
  } else {
    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError, gpsOptions);
  }
}

function handleLocationSuccess(position) {
  const hadLocation = Boolean(state.userLocation);

  state.userLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
    updatedAt: position.timestamp,
  };
  state.locationError = "";

  const nearestHub = getNearestCityLabel(state.userLocation);
  state.city = nearestHub;
  persistSearchState();
  if (elements.quickCity) {
    elements.quickCity.value = nearestHub;
  }
  if (elements.cityFilter) {
    elements.cityFilter.value = nearestHub;
  }

  renderMechanics();
  void refreshEnvironment();

  if (!hadLocation) {
    showToast("Live GPS enabled. MechGo is ranking mechanics by closest dispatch distance.");
  }
}

function handleLocationError(error) {
  const fallbackMessage = "Location access did not complete. You can still search by city.";
  const errorMessages = {
    1: "Location permission was denied. City search is still available.",
    2: "Your GPS position could not be determined. Try again in an open area.",
    3: "GPS timed out. Try requesting your location again.",
  };

  state.locationError = errorMessages[error.code] || fallbackMessage;

  if (state.locationWatchId !== null && !state.userLocation) {
    navigator.geolocation.clearWatch(state.locationWatchId);
    state.locationWatchId = null;
  }

  updateLocationPanel();
  showToast(state.locationError);
}

function stopLocationTracking() {
  if (state.locationWatchId !== null && "geolocation" in navigator) {
    navigator.geolocation.clearWatch(state.locationWatchId);
  }

  state.locationWatchId = null;
  state.userLocation = null;
  state.locationError = "";
  persistSearchState();

  renderMechanics();
  void refreshEnvironment();
  showToast("GPS matching paused. MechGo is using city pricing and weather again.");
}

async function refreshEnvironment() {
  if (!shouldLoadEnvironment()) {
    return;
  }

  const requestId = ++state.environmentRequestId;
  const gpsLocation = getGpsPricingLocation();

  if (gpsLocation) {
    state.activeLocation = gpsLocation;
    state.weatherError = "";

    if (!shouldRefreshWeather(gpsLocation)) {
      state.weatherStatus = state.weather ? "ready" : "idle";
      updateLocationPanel();
      renderMechanics();
      return;
    }

    state.weatherStatus = "loading";
    updateLocationPanel();
    renderMechanics();

    const weather = await fetchWeatherForLocation(gpsLocation);
    if (requestId !== state.environmentRequestId) {
      return;
    }

    applyWeatherResult(weather, gpsLocation);
    updateLocationPanel();
    renderMechanics();
    return;
  }

  const query = state.city.trim();
  if (!query) {
    state.manualLocation = null;
    state.activeLocation = null;
    state.weather = null;
    state.weatherStatus = "idle";
    state.weatherError = "";
    state.weatherLocationKey = "";
    updateLocationPanel();
    renderMechanics();
    return;
  }

  const normalizedQuery = normalizeLocationQuery(query);
  if (
    state.manualLocation &&
    normalizeLocationQuery(state.manualLocation.query) === normalizedQuery
  ) {
    state.activeLocation = {
      ...state.manualLocation,
      source: "city",
    };
  } else {
    state.manualLocation = null;
    state.activeLocation = null;
    state.weather = null;
    state.weatherStatus = "loading";
    state.weatherError = "";
    updateLocationPanel();
    renderMechanics();

    const mappedLocation = await fetchCityLocation(query);
    if (requestId !== state.environmentRequestId) {
      return;
    }

    if (!mappedLocation) {
      state.weatherStatus = "error";
      state.weatherError = "Could not map that city for weather-aware pricing yet.";
      updateLocationPanel();
      renderMechanics();
      return;
    }

    state.manualLocation = mappedLocation;
    state.activeLocation = {
      ...mappedLocation,
      source: "city",
    };
  }

  if (!shouldRefreshWeather(state.activeLocation)) {
    state.weatherStatus = state.weather ? "ready" : "idle";
    updateLocationPanel();
    renderMechanics();
    return;
  }

  state.weatherStatus = "loading";
  updateLocationPanel();
  renderMechanics();

  const weather = await fetchWeatherForLocation(state.activeLocation);
  if (requestId !== state.environmentRequestId) {
    return;
  }

  applyWeatherResult(weather, state.activeLocation);
  updateLocationPanel();
  renderMechanics();
}

function applyWeatherResult(weather, location) {
  if (!weather) {
    state.weather = null;
    state.weatherStatus = "error";
    state.weatherError = "Live weather pricing is temporarily unavailable.";
    state.weatherLocationKey = "";
    return;
  }

  state.weather = weather;
  state.weatherStatus = "ready";
  state.weatherError = "";
  state.weatherLocationKey = getWeatherCacheKey(location);
}

function getGpsPricingLocation() {
  if (!state.userLocation) {
    return null;
  }

  return {
    lat: state.userLocation.lat,
    lng: state.userLocation.lng,
    label: getNearestCityLabel(state.userLocation),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    source: "gps",
  };
}

function shouldRefreshWeather(location) {
  if (!location) {
    return false;
  }

  if (!state.weather || !state.weather.fetchedAt) {
    return true;
  }

  const cacheKey = getWeatherCacheKey(location);
  const isFresh = Date.now() - state.weather.fetchedAt < weatherCacheTtlMs;
  return !(cacheKey === state.weatherLocationKey && isFresh);
}

async function fetchCityLocation(query) {
  const cacheKey = normalizeLocationQuery(query);
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const url = new URL(geocodeApiBase);
    url.searchParams.set("name", query);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const firstResult = data.results && data.results[0];
    if (!firstResult) {
      return null;
    }

    const location = {
      query,
      label: formatGeocodedLabel(firstResult),
      lat: firstResult.latitude,
      lng: firstResult.longitude,
      timezone: firstResult.timezone || "UTC",
    };

    geocodeCache.set(cacheKey, location);
    return location;
  } catch (error) {
    return null;
  }
}

async function fetchWeatherForLocation(location) {
  const cacheKey = getWeatherCacheKey(location);
  const cachedWeather = weatherCache.get(cacheKey);
  if (cachedWeather && Date.now() - cachedWeather.cachedAt < weatherCacheTtlMs) {
    return cachedWeather.weather;
  }

  try {
    const url = new URL(weatherApiBase);
    url.searchParams.set("latitude", String(location.lat));
    url.searchParams.set("longitude", String(location.lng));
    url.searchParams.set(
      "current",
      "temperature_2m,precipitation,wind_speed_10m,weather_code,is_day"
    );
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("wind_speed_unit", "mph");
    url.searchParams.set("precipitation_unit", "inch");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "1");

    const response = await fetch(url.toString());
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.current) {
      return null;
    }

    const weather = {
      temperature: data.current.temperature_2m,
      precipitation: data.current.precipitation,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      isDay: Boolean(data.current.is_day),
      fetchedAt: Date.now(),
    };

    weatherCache.set(cacheKey, {
      cachedAt: weather.fetchedAt,
      weather,
    });
    return weather;
  } catch (error) {
    return null;
  }
}

function syncFiltersToState() {
  if (elements.cityFilter) {
    elements.cityFilter.value = state.city;
  }
  if (elements.issueFilter) {
    elements.issueFilter.value = state.issue;
  }
  if (elements.urgencyFilter) {
    elements.urgencyFilter.value = state.urgency;
  }
}

function syncQuickRequestInputs() {
  if (elements.quickCity) {
    elements.quickCity.value = state.city;
  }
  if (elements.quickIssue) {
    elements.quickIssue.value = state.issue === "all" ? "battery" : state.issue;
  }
  if (elements.quickUrgency) {
    elements.quickUrgency.value = state.urgency === "all" ? "emergency" : state.urgency;
  }
}

function clearManualPricingContextIfNeeded() {
  if (state.userLocation) {
    return;
  }

  const currentQuery = normalizeLocationQuery(state.city || "");
  const previousQuery = state.manualLocation
    ? normalizeLocationQuery(state.manualLocation.query)
    : "";

  if (!currentQuery || !state.manualLocation || currentQuery === previousQuery) {
    return;
  }

  state.activeLocation = null;
  state.weather = null;
  state.weatherStatus = "loading";
  state.weatherError = "";
  state.weatherLocationKey = "";
}

function getMarketplaceMechanics() {
  return [...mechanics, ...state.mechanicProfiles.map(mapRegisteredMechanicToMarketplace)];
}

function mapRegisteredMechanicToMarketplace(profile) {
  const specialties = profile.specialties && profile.specialties.length
    ? profile.specialties
    : ["diagnostic"];

  return {
    id: profile.id,
    name: profile.businessName,
    city: profile.baseCity,
    coordinates: profile.coordinates || resolveMechanicCoordinates(profile.baseCity),
    baseCallout: profile.baseCallout || 82,
    serviceRadiusMiles: profile.serviceRadiusMiles || 24,
    etaMinutes: profile.etaMinutes || 18,
    rating: profile.rating || 4.8,
    jobsCompleted: profile.jobsCompleted || 0,
    distanceHint: "Registered MechGo partner",
    availability: getMechanicAvailabilityLabel(profile.dispatchMode),
    urgency: getDispatchUrgencyOptions(profile.dispatchMode),
    specialties,
    blurb:
      profile.bio ||
      `Dispatch-ready MechGo mechanic covering ${profile.baseCity} for ${specialties
        .map((specialty) => titleCase(specialty))
        .join(", ")} jobs.`,
  };
}

function getFilteredMechanics() {
  const pricingContext = getPricingContext();

  return getMarketplaceMechanics()
    .map((mechanic) => {
      const distanceMiles = state.activeLocation
        ? getDistanceMiles(state.activeLocation, mechanic.coordinates)
        : null;
      const requestedService = getRequestedServiceForMechanic(mechanic);
      const quote = buildQuote(mechanic, requestedService, distanceMiles, pricingContext);
      const liveEtaMinutes = getLiveEtaMinutes(
        mechanic.etaMinutes,
        distanceMiles,
        pricingContext.time.etaOffset
      );

      return {
        ...mechanic,
        requestedService,
        distanceMiles,
        displayDistance:
          Number.isFinite(distanceMiles) ? formatDistanceMiles(distanceMiles) : mechanic.distanceHint,
        liveEtaMinutes,
        quote,
      };
    })
    .filter((mechanic) => {
      const matchesIssue =
        state.issue === "all" || mechanic.specialties.includes(state.issue);
      const matchesUrgency =
        state.urgency === "all" || mechanic.urgency.includes(state.urgency);

      let matchesLocation = true;
      if (state.activeLocation && Number.isFinite(mechanic.distanceMiles)) {
        matchesLocation = mechanic.distanceMiles <= mechanic.serviceRadiusMiles;
      } else if (!state.activeLocation) {
        matchesLocation =
          !state.city || mechanic.city.toLowerCase().includes(state.city.toLowerCase());
      }

      return matchesIssue && matchesUrgency && matchesLocation;
    })
    .sort((left, right) => {
      if (Number.isFinite(left.distanceMiles) && Number.isFinite(right.distanceMiles)) {
        return left.distanceMiles - right.distanceMiles || left.liveEtaMinutes - right.liveEtaMinutes;
      }

      return left.liveEtaMinutes - right.liveEtaMinutes;
    });
}

function renderMechanics() {
  if (!elements.mechanicGrid || !elements.mechanicTemplate || !elements.resultsSummary) {
    updateHeroCommandCenter();
    return;
  }

  const activeAccount = getActiveAuthAccount();
  const filteredMechanics = getFilteredMechanics();
  elements.mechanicGrid.innerHTML = "";

  const issueLabel = state.issue === "all" ? "all services" : serviceProfiles[state.issue].label;
  const urgencyLabel = state.urgency === "all" ? "any availability" : state.urgency;

  if (state.activeLocation) {
    elements.resultsSummary.textContent = `${filteredMechanics.length} mechanic${
      filteredMechanics.length === 1 ? "" : "s"
    } matched for ${issueLabel} near ${state.activeLocation.label} with ${urgencyLabel} availability.`;
  } else {
    const summaryCity = state.city || "all cities";
    elements.resultsSummary.textContent = `${filteredMechanics.length} mechanic${
      filteredMechanics.length === 1 ? "" : "s"
    } matched for ${issueLabel} in ${summaryCity} with ${urgencyLabel} availability.`;
  }

  if (!filteredMechanics.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = state.activeLocation
      ? "No mechanics match that issue and urgency inside this service radius right now. Try a different service type or switch cities."
      : "No mechanics match that combination yet. Try broadening the city or changing the service filter.";
    elements.mechanicGrid.appendChild(emptyState);
    updateHeroCommandCenter(0);
    refreshInteractiveSurfaces();
    return;
  }

  filteredMechanics.forEach((mechanic) => {
    const card = elements.mechanicTemplate.content.firstElementChild.cloneNode(true);

    card.querySelector(".mechanic-city").textContent = mechanic.city;
    card.querySelector(".mechanic-name").textContent = mechanic.name;
    card.querySelector(".eta-badge").textContent = `${mechanic.liveEtaMinutes} min ETA`;
    card.querySelector(".mechanic-blurb").textContent = mechanic.blurb;
    card.querySelector(".rating-pill").textContent = `${mechanic.rating.toFixed(1)} stars`;
    card.querySelector(".price-pill").textContent = `${mechanic.quote.displayRange} estimate`;
    card.querySelector(".jobs-pill").textContent = `${mechanic.jobsCompleted}+ jobs`;
    card.querySelector(".pricing-note").textContent = mechanic.quote.breakdownNote;
    card.querySelector(".availability-label").textContent = mechanic.availability;
    card.querySelector(".distance-label").textContent = mechanic.displayDistance;

    const skillRow = card.querySelector(".skill-row");
    const bookButton = card.querySelector(".book-button");
    mechanic.specialties.forEach((specialty) => {
      const tag = document.createElement("span");
      tag.className = "skill-tag";
      tag.textContent = titleCase(specialty);
      skillRow.appendChild(tag);
    });

    if (bookButton) {
      bookButton.textContent = activeAccount
        ? activeAccount.role === "customer"
          ? "Book now"
          : "Customer account required"
        : "Sign in to book";
      bookButton.addEventListener("click", () => openBookingModal(mechanic));
    }
    elements.mechanicGrid.appendChild(card);
  });

  updateHeroCommandCenter(filteredMechanics.length);
  refreshInteractiveSurfaces();
}

function ensureCustomerAccountForBooking(mechanicId = "") {
  const activeAccount = getActiveAuthAccount();
  if (activeAccount && activeAccount.role === "customer") {
    return true;
  }

  state.postAuthRedirect = {
    path: "marketplace.html",
    reason: "booking",
    mechanicId: mechanicId || "",
    requestedAt: new Date().toISOString(),
  };
  persistPostAuthRedirect();
  window.location.href = "signin.html?role=customer&mode=create";
  return false;
}

function openBookingModal(mechanic) {
  if (
    !elements.bookingModal ||
    !elements.selectedMechanicId ||
    !elements.serviceType ||
    !elements.bookingTitle ||
    !elements.bookingSubtitle ||
    !elements.bookingSummary ||
    !elements.customerName ||
    !elements.customerPhone ||
    !elements.vehicleInfo ||
    !elements.breakdownLocation ||
    !elements.repairNotes
  ) {
    return;
  }

  if (!ensureCustomerAccountForBooking(mechanic.id)) {
    return;
  }

  const activeCustomer = getActiveCustomerProfile();

  state.selectedMechanic = mechanic;
  elements.selectedMechanicId.value = mechanic.id;
  elements.serviceType.value = mechanic.requestedService;
  elements.bookingTitle.textContent = `Book ${mechanic.name}`;
  elements.bookingSubtitle.textContent =
    `${mechanic.city} | ${mechanic.displayDistance} | ${mechanic.liveEtaMinutes} min ETA`;
  elements.bookingSummary.innerHTML = buildBookingSummaryHtml(mechanic.quote);
  elements.customerName.value = activeCustomer ? activeCustomer.fullName : "";
  elements.customerPhone.value = activeCustomer ? activeCustomer.phone : "";
  elements.vehicleInfo.value = activeCustomer ? activeCustomer.vehicle : "";
  elements.breakdownLocation.value = state.userLocation
    ? `GPS coordinates: ${formatCoordinates(state.userLocation)}`
    : state.activeLocation
      ? `${state.activeLocation.label} roadside location`
      : state.city
        ? `${state.city} roadside location`
        : "";
  elements.repairNotes.value = `Need ${titleCase(mechanic.requestedService)} help.`;
  elements.bookingModal.classList.remove("hidden");
  elements.bookingModal.setAttribute("aria-hidden", "false");
}

function buildBookingSummaryHtml(quote) {
  const activeCustomer = getActiveCustomerProfile();
  const defaultPaymentMethod = getDefaultPaymentMethod(activeCustomer);
  const billingSummary = activeCustomer
    ? `Billing profile: ${formatCustomerHandle(activeCustomer.username)}${
        defaultPaymentMethod ? ` | ${formatPaymentMethodLabel(defaultPaymentMethod)}` : " | no default payment method yet"
      }`
    : "Billing profile: Customer account required";

  return `
    <strong>${quote.displayRange}</strong> estimated total<br />
    Base dispatch: ${formatCurrency(quote.baseCallout)}<br />
    Service labor: ${formatCurrency(quote.laborCharge)}<br />
    Travel distance: ${formatCurrency(quote.travelCharge)}<br />
    Time of day: ${formatCurrency(quote.timeCharge)}<br />
    Weather impact: ${formatCurrency(quote.weatherCharge)}<br />
    <span>${quote.breakdownNote}</span><br />
    <span>${billingSummary}</span>
  `;
}

function handleServiceTypeChange() {
  if (!state.selectedMechanic || !elements.serviceType || !elements.bookingSummary || !elements.repairNotes) {
    return;
  }

  const selectedService = elements.serviceType.value;
  const pricingContext = getPricingContext();
  const updatedQuote = buildQuote(
    state.selectedMechanic,
    selectedService,
    state.selectedMechanic.distanceMiles,
    pricingContext
  );

  state.selectedMechanic = {
    ...state.selectedMechanic,
    requestedService: selectedService,
    quote: updatedQuote,
  };

  if (!elements.repairNotes.value.trim() || elements.repairNotes.value.startsWith("Need ")) {
    elements.repairNotes.value = `Need ${titleCase(selectedService)} help.`;
  }

  elements.bookingSummary.innerHTML = buildBookingSummaryHtml(updatedQuote);
}

function closeModal() {
  state.selectedMechanic = null;
  if (!elements.bookingModal) {
    return;
  }
  elements.bookingModal.classList.add("hidden");
  elements.bookingModal.setAttribute("aria-hidden", "true");
}

function handleModalBackdrop(event) {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
    closeModal();
  }
}

function handleBookingSubmit(event) {
  event.preventDefault();

  if (
    !elements.serviceType ||
    !elements.customerName ||
    !elements.customerPhone ||
    !elements.vehicleInfo ||
    !elements.breakdownLocation ||
    !elements.repairNotes ||
    !elements.bookingForm
  ) {
    return;
  }

  const mechanic = state.selectedMechanic;
  if (!mechanic) {
    showToast("Please choose a mechanic before booking.");
    return;
  }

  if (!ensureCustomerAccountForBooking()) {
    return;
  }

  const activeCustomer = getActiveCustomerProfile();
  const defaultPaymentMethod = getDefaultPaymentMethod(activeCustomer);
  const urgency = pickUrgencyForMechanic(mechanic);
  const booking = {
    id: `job-${Date.now()}`,
    mechanicId: mechanic.id,
    mechanicName: mechanic.name,
    city: mechanic.city,
    etaMinutes: mechanic.liveEtaMinutes,
    distanceLabel: mechanic.displayDistance,
    serviceType: elements.serviceType.value,
    quoteRangeLabel: mechanic.quote.displayRange,
    quoteBreakdown: mechanic.quote.breakdownNote,
    customerName: elements.customerName.value.trim(),
    customerPhone: elements.customerPhone.value.trim(),
    customerUsername: activeCustomer ? activeCustomer.username : "",
    customerId: activeCustomer ? activeCustomer.id : "",
    vehicleInfo: elements.vehicleInfo.value.trim(),
    location: elements.breakdownLocation.value.trim(),
    notes: elements.repairNotes.value.trim(),
    paymentMethodLabel: defaultPaymentMethod ? formatPaymentMethodLabel(defaultPaymentMethod) : "No default payment method",
    urgency,
    status: urgency === "emergency" ? "Assigned now" : urgency === "today" ? "Confirmed today" : "Scheduled",
    timeline: timelineSteps[urgency],
    createdAt: new Date().toISOString(),
  };

  state.bookings = [booking, ...state.bookings].slice(0, 6);
  persistBookings();
  clearPostAuthRedirect();
  renderBookings();
  elements.bookingForm.reset();
  closeModal();
  showToast("Roadside booking confirmed and quote locked on the dispatch board.");
}

function renderBookings() {
  if (!elements.bookingList || !elements.bookingCount || !elements.bookingTemplate) {
    return;
  }

  elements.bookingList.innerHTML = "";
  elements.bookingCount.textContent = `${state.bookings.length} job${
    state.bookings.length === 1 ? "" : "s"
  }`;

  if (!state.bookings.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "No bookings saved yet. Book a mechanic to populate the live dispatch board.";
    elements.bookingList.appendChild(emptyState);
    refreshInteractiveSurfaces();
    return;
  }

  state.bookings.forEach((booking) => {
    const card = elements.bookingTemplate.content.firstElementChild.cloneNode(true);

    card.querySelector(".booking-status").textContent = booking.status;
    card.querySelector(".booking-mechanic").textContent = booking.mechanicName;
    card.querySelector(".booking-eta").textContent = `${booking.etaMinutes} min ETA`;
    card.querySelector(".booking-service").textContent =
      `${titleCase(booking.serviceType)} for ${booking.vehicleInfo} | ${
        booking.customerUsername
          ? formatCustomerHandle(booking.customerUsername)
          : booking.customerName || "Guest customer"
      }`;
    card.querySelector(".booking-quote").textContent =
      `${booking.quoteRangeLabel} locked estimate | ${booking.quoteBreakdown} | Billing: ${
        booking.paymentMethodLabel || "Guest checkout"
      }`;
    card.querySelector(".booking-location").textContent =
      `${booking.location} | ${booking.distanceLabel}`;

    const timelineContainer = card.querySelector(".booking-timeline");
    booking.timeline.forEach((step) => {
      const chip = document.createElement("span");
      chip.className = "timeline-chip";
      chip.textContent = step;
      timelineContainer.appendChild(chip);
    });

    elements.bookingList.appendChild(card);
  });

  refreshInteractiveSurfaces();
}

function handleDriverVerificationSubmit(event) {
  event.preventDefault();

  if (
    !elements.licenseUpload ||
    !elements.registrationUpload ||
    !elements.insuranceUpload ||
    !elements.driverFullName ||
    !elements.driverEmail ||
    !elements.driverPhone ||
    !elements.driverVehicle ||
    !elements.driverHomeCity ||
    !elements.driverVerificationForm
  ) {
    return;
  }

  const licenseFile = elements.licenseUpload.files[0];
  const registrationFile = elements.registrationUpload.files[0];
  const insuranceFile = elements.insuranceUpload.files[0];

  if (!licenseFile || !registrationFile || !insuranceFile) {
    showToast("Please upload the required documents before submitting.");
    return;
  }

  const submission = {
    id: `verify-${Date.now()}`,
    fullName: elements.driverFullName.value.trim(),
    email: elements.driverEmail.value.trim(),
    phone: elements.driverPhone.value.trim(),
    vehicle: elements.driverVehicle.value.trim(),
    homeCity: elements.driverHomeCity.value.trim(),
    status: "Pending review",
    submittedAt: new Date().toISOString(),
    documents: [
      { label: "License", name: licenseFile.name },
      { label: "Registration", name: registrationFile.name },
      { label: "Insurance", name: insuranceFile.name },
    ],
  };

  state.driverVerifications = [submission, ...state.driverVerifications].slice(0, 8);
  persistDriverVerifications();
  renderDriverVerifications();
  elements.driverVerificationForm.reset();
  elements.driverHomeCity.value = state.city;
  updateDriverDocSummary();
  showToast("Driver profile submitted for verification.");
}

function updateDriverDocSummary() {
  if (!elements.driverDocSummary) {
    return;
  }

  const selectedDocs = getSelectedDriverDocuments();

  if (!selectedDocs.length) {
    elements.driverDocSummary.textContent =
      "No files selected yet. Uploaded document names will appear here for review.";
    return;
  }

  elements.driverDocSummary.textContent = selectedDocs
    .map((documentEntry) => `${documentEntry.label}: ${documentEntry.name}`)
    .join(" | ");
}

function getSelectedDriverDocuments() {
  if (!elements.licenseUpload || !elements.registrationUpload || !elements.insuranceUpload) {
    return [];
  }

  const fileFields = [
    { label: "License", input: elements.licenseUpload },
    { label: "Registration", input: elements.registrationUpload },
    { label: "Insurance", input: elements.insuranceUpload },
  ];

  return fileFields
    .map((field) => ({
      label: field.label,
      name: field.input.files[0] ? field.input.files[0].name : "",
    }))
    .filter((field) => field.name);
}

function renderDriverVerifications() {
  if (!elements.verificationList || !elements.verificationCount || !elements.verificationTemplate) {
    return;
  }

  elements.verificationList.innerHTML = "";
  elements.verificationCount.textContent = `${state.driverVerifications.length} submission${
    state.driverVerifications.length === 1 ? "" : "s"
  }`;

  if (!state.driverVerifications.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "No driver verification submissions yet. Upload required documents to create the first profile.";
    elements.verificationList.appendChild(emptyState);
    refreshInteractiveSurfaces();
    return;
  }

  state.driverVerifications.forEach((submission) => {
    const card = elements.verificationTemplate.content.firstElementChild.cloneNode(true);

    card.querySelector(".verification-status").textContent = submission.status;
    card.querySelector(".verification-name").textContent = submission.fullName;
    card.querySelector(".verification-time").textContent = formatSubmissionTime(submission.submittedAt);
    card.querySelector(".verification-vehicle").textContent =
      `${submission.vehicle} | ${submission.homeCity}`;
    card.querySelector(".verification-contact").textContent =
      `${submission.email} | ${submission.phone}`;

    const docsContainer = card.querySelector(".verification-docs");
    submission.documents.forEach((documentEntry) => {
      const tag = document.createElement("span");
      tag.className = "verification-doc-tag";
      tag.textContent = `${documentEntry.label}: ${documentEntry.name}`;
      docsContainer.appendChild(tag);
    });

      elements.verificationList.appendChild(card);
    });

  refreshInteractiveSurfaces();
}

function syncAuthCreateDefaults() {
  if (elements.createCustomerHomeCity && !elements.createCustomerHomeCity.value.trim()) {
    elements.createCustomerHomeCity.value = state.city || "Austin, TX";
  }

  if (elements.createMechanicBaseCity && !elements.createMechanicBaseCity.value.trim()) {
    elements.createMechanicBaseCity.value = state.city || "Austin, TX";
  }
}

function handleCustomerSignInSubmit(event) {
  event.preventDefault();

  signInWithCredentials(
    "customer",
    elements.customerSignInIdentifier ? elements.customerSignInIdentifier.value : "",
    elements.customerSignInPassword ? elements.customerSignInPassword.value : ""
  );
}

function handleMechanicSignInSubmit(event) {
  event.preventDefault();

  signInWithCredentials(
    "mechanic",
    elements.mechanicSignInIdentifier ? elements.mechanicSignInIdentifier.value : "",
    elements.mechanicSignInPassword ? elements.mechanicSignInPassword.value : ""
  );
}

async function signInWithCredentials(role, identifierValue, passwordValue) {
  const identifier = normalizeIdentifier(identifierValue);
  const password = passwordValue.trim();

  if (!identifier || !password) {
    showToast("Enter your username or email and password to continue.");
    return;
  }

  if (window.MechGoApi) {
    try {
      const payload = await window.MechGoApi.login({
        identifier: identifierValue.trim(),
        password,
      });
      if (!payload.user || payload.user.role !== role) {
        showToast(`That account is not authorized for ${role} access.`);
        return;
      }

      const apiAccount = mapApiUserToAuthAccount(payload.user, role);
      state.authAccounts = [
        apiAccount,
        ...state.authAccounts.filter((account) => account.id !== apiAccount.id),
      ];
      persistAuthAccounts();
      state.authViewRole = role;
      state.authViewMode = "signin";
      setSignedInAccount(apiAccount);
      if (getCurrentPageName() === "signin.html") {
        window.location.href = getPostSignInDestination(apiAccount);
        return;
      }
      renderAfterAuthChange();
      showToast(
        role === "customer"
          ? `Signed in as ${formatCustomerHandle(apiAccount.username)}.`
          : `Signed in as ${formatMechanicHandle(apiAccount.username)}.`
      );
      return;
    } catch (error) {
      if (!findAuthAccount(role, identifier)) {
        showToast(error.message || `That ${role} sign-in did not match a saved MechGo account.`);
        return;
      }
    }
  }

  const matchedAccount = findAuthAccount(role, identifier);
  if (!matchedAccount || matchedAccount.password !== password) {
    showToast(`That ${role} sign-in did not match a saved MechGo account.`);
    return;
  }

  state.authViewRole = role;
  state.authViewMode = "signin";
  setSignedInAccount(matchedAccount);
  if (getCurrentPageName() === "signin.html") {
    window.location.href = getPostSignInDestination(matchedAccount);
    return;
  }
  renderAfterAuthChange();
  showToast(
    role === "customer"
      ? `Signed in as ${formatCustomerHandle(matchedAccount.username)}.`
      : `Signed in as ${formatMechanicHandle(matchedAccount.username)}.`
  );
}

async function handleCustomerAccountCreate(event) {
  event.preventDefault();

  if (
    !elements.customerCreateForm ||
    !elements.createCustomerFullName ||
    !elements.createCustomerUsername ||
    !elements.createCustomerEmail ||
    !elements.createCustomerPhone ||
    !elements.createCustomerHomeCity ||
    !elements.createCustomerVehicle ||
    !elements.createCustomerPassword ||
    !elements.createCustomerPasswordConfirm
  ) {
    return;
  }

  const fullName = elements.createCustomerFullName.value.trim();
  const username = normalizeUsername(elements.createCustomerUsername.value);
  const email = normalizeEmail(elements.createCustomerEmail.value);
  const phone = elements.createCustomerPhone.value.trim();
  const homeCity = elements.createCustomerHomeCity.value.trim() || state.city || "Austin, TX";
  const vehicle = elements.createCustomerVehicle.value.trim();
  const password = elements.createCustomerPassword.value.trim();
  const confirmPassword = elements.createCustomerPasswordConfirm.value.trim();

  if (!fullName || !username || !email || !phone || !vehicle) {
    showToast("Complete every customer account field before creating the profile.");
    return;
  }

  if (!validateAccountPassword(password, confirmPassword)) {
    return;
  }

  const conflictingAccount = findConflictingAuthAccount("customer", username, email);
  if (conflictingAccount) {
    showToast(conflictingAccount);
    return;
  }

  const existingProfile = resolveCustomerProfileByIdentity(username, email);
  const timestamp = new Date().toISOString();
  const nextProfile = {
    id: existingProfile ? existingProfile.id : `cust-${Date.now()}`,
    fullName,
    username,
    email,
    phone,
    homeCity,
    address: existingProfile ? existingProfile.address || "" : "",
    preferredContact: existingProfile ? existingProfile.preferredContact || "phone" : "phone",
    vehicle,
    secondaryVehicle: existingProfile ? existingProfile.secondaryVehicle || "" : "",
    plateNumber: existingProfile ? existingProfile.plateNumber || "" : "",
    roadsideNotes: existingProfile ? existingProfile.roadsideNotes || "" : "",
    membershipTier: existingProfile ? existingProfile.membershipTier || "starter" : "starter",
    servicePreference: existingProfile ? existingProfile.servicePreference || "battery" : "battery",
    joinedAt: existingProfile ? existingProfile.joinedAt : timestamp,
    updatedAt: timestamp,
    paymentMethods: existingProfile ? existingProfile.paymentMethods || [] : [],
  };

  state.customerProfiles = existingProfile
    ? state.customerProfiles.map((profile) => (profile.id === nextProfile.id ? nextProfile : profile))
    : [nextProfile, ...state.customerProfiles].slice(0, 12);
  state.activeCustomerId = nextProfile.id;
  persistCustomerProfiles();
  persistActiveCustomerId();

  let nextAccount = {
    id: `acct-${Date.now()}`,
    role: "customer",
    username,
    email,
    password,
    profileId: nextProfile.id,
    displayName: fullName,
    settings: buildDefaultAccountSettings({
      role: "customer",
      email,
    }),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (window.MechGoApi) {
    try {
      const payload = await window.MechGoApi.register({
        role: "customer",
        fullName,
        username,
        email,
        phone,
        password,
      });
      if (payload.user) {
        nextAccount = {
          ...nextAccount,
          id: payload.user.id,
          createdAt: payload.user.createdAt || nextAccount.createdAt,
          updatedAt: payload.user.updatedAt || nextAccount.updatedAt,
        };
      }
    } catch (error) {
      console.warn("MechGo API registration skipped:", error.message);
    }
  }

  state.authAccounts = [nextAccount, ...state.authAccounts].slice(0, 24);
  persistAuthAccounts();
  state.authViewRole = "customer";
  state.authViewMode = "signin";
  setSignedInAccount(nextAccount);
  if (getCurrentPageName() === "signin.html") {
    window.location.href = getPostSignInDestination(nextAccount);
    return;
  }
  elements.customerCreateForm.reset();
  syncAuthCreateDefaults();
  renderAfterAuthChange();
  showToast(`Created ${formatCustomerHandle(username)} and signed the customer in.`);
}

async function handleMechanicAccountCreate(event) {
  event.preventDefault();

  if (
    !elements.mechanicCreateForm ||
    !elements.createMechanicBusinessName ||
    !elements.createMechanicUsername ||
    !elements.createMechanicLeadName ||
    !elements.createMechanicEmail ||
    !elements.createMechanicPhone ||
    !elements.createMechanicBaseCity ||
    !elements.createMechanicPrimaryService ||
    !elements.createMechanicPassword ||
    !elements.createMechanicPasswordConfirm
  ) {
    return;
  }

  const businessName = elements.createMechanicBusinessName.value.trim();
  const username = normalizeUsername(elements.createMechanicUsername.value);
  const leadName = elements.createMechanicLeadName.value.trim();
  const email = normalizeEmail(elements.createMechanicEmail.value);
  const phone = elements.createMechanicPhone.value.trim();
  const baseCity = elements.createMechanicBaseCity.value.trim() || state.city || "Austin, TX";
  const primaryService = elements.createMechanicPrimaryService.value || "diagnostic";
  const password = elements.createMechanicPassword.value.trim();
  const confirmPassword = elements.createMechanicPasswordConfirm.value.trim();

  if (!businessName || !username || !leadName || !email || !phone || !baseCity) {
    showToast("Complete every mechanic account field before creating the profile.");
    return;
  }

  if (!validateAccountPassword(password, confirmPassword)) {
    return;
  }

  const conflictingAccount = findConflictingAuthAccount("mechanic", username, email);
  if (conflictingAccount) {
    showToast(conflictingAccount);
    return;
  }

  const existingProfile = resolveMechanicProfileByIdentity(username, email);
  const timestamp = new Date().toISOString();
  const nextProfile = {
    id: existingProfile ? existingProfile.id : `mech-${Date.now()}`,
    businessName,
    username,
    leadName,
    email,
    phone,
    baseCity,
    baseAddress: existingProfile ? existingProfile.baseAddress || "" : "",
    serviceRadiusMiles: existingProfile ? existingProfile.serviceRadiusMiles || 25 : 25,
    baseCallout: existingProfile ? existingProfile.baseCallout || 84 : 84,
    etaMinutes: existingProfile ? existingProfile.etaMinutes || 18 : 18,
    jobsCompleted: existingProfile ? existingProfile.jobsCompleted || 0 : 0,
    dispatchMode: existingProfile ? existingProfile.dispatchMode || "full" : "full",
    serviceVehicle: existingProfile ? existingProfile.serviceVehicle || "" : "",
    credentialStatus: existingProfile ? existingProfile.credentialStatus || "Verified credentials pending" : "Verified credentials pending",
    coverageNotes: existingProfile ? existingProfile.coverageNotes || "" : "",
    bio:
      existingProfile && existingProfile.bio
        ? existingProfile.bio
        : `${businessName} provides ${titleCase(primaryService)} roadside support through MechGo.`,
    specialties:
      existingProfile && existingProfile.specialties && existingProfile.specialties.length
        ? existingProfile.specialties
        : [primaryService],
    payoutMethods: existingProfile ? existingProfile.payoutMethods || [] : [],
    coordinates: existingProfile ? existingProfile.coordinates : resolveMechanicCoordinates(baseCity),
    joinedAt: existingProfile ? existingProfile.joinedAt : timestamp,
    updatedAt: timestamp,
  };

  state.mechanicProfiles = existingProfile
    ? state.mechanicProfiles.map((profile) => (profile.id === nextProfile.id ? nextProfile : profile))
    : [nextProfile, ...state.mechanicProfiles].slice(0, 12);
  state.activeMechanicId = nextProfile.id;
  persistMechanicProfiles();
  persistActiveMechanicId();

  let nextAccount = {
    id: `acct-${Date.now()}`,
    role: "mechanic",
    username,
    email,
    password,
    profileId: nextProfile.id,
    displayName: businessName,
    settings: buildDefaultAccountSettings({
      role: "mechanic",
      email,
    }),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (window.MechGoApi) {
    try {
      const payload = await window.MechGoApi.register({
        role: "mechanic",
        fullName: leadName || businessName,
        username,
        email,
        phone,
        password,
      });
      if (payload.user) {
        nextAccount = {
          ...nextAccount,
          id: payload.user.id,
          createdAt: payload.user.createdAt || nextAccount.createdAt,
          updatedAt: payload.user.updatedAt || nextAccount.updatedAt,
        };
      }
    } catch (error) {
      console.warn("MechGo API registration skipped:", error.message);
    }
  }

  state.authAccounts = [nextAccount, ...state.authAccounts].slice(0, 24);
  persistAuthAccounts();
  state.authViewRole = "mechanic";
  state.authViewMode = "signin";
  setSignedInAccount(nextAccount);
  if (getCurrentPageName() === "signin.html") {
    window.location.href = getPostSignInDestination(nextAccount);
    return;
  }
  elements.mechanicCreateForm.reset();
  syncAuthCreateDefaults();
  renderAfterAuthChange();
  showToast(`Created ${businessName} and signed the mechanic account in.`);
}

function handleSignOut() {
  if (!getActiveAuthAccount()) {
    return;
  }

  clearAuthSession();
  clearPostAuthRedirect();
  applyThemeMode("dark");
  if (isProtectedPage(getCurrentPageName())) {
    window.location.href = "signin.html";
    return;
  }
  renderAfterAuthChange();
  showToast("Signed out of the MechGo access portal.");
}

function validateAccountPassword(password, confirmPassword) {
  if (password.length < 10) {
    showToast("Use a password with at least 10 characters for this MechGo account.");
    return false;
  }

  if (password !== confirmPassword) {
    showToast("The passwords do not match yet.");
    return false;
  }

  return true;
}

function findConflictingAuthAccount(role, username, email) {
  const duplicateUsername = state.authAccounts.find((account) => account.username === username);
  if (duplicateUsername) {
    return "That username is already tied to a MechGo sign-in.";
  }

  const duplicateEmail = state.authAccounts.find(
    (account) => account.role === role && normalizeEmail(account.email) === email
  );
  if (duplicateEmail) {
    return `That email already has a ${role} account in MechGo. Try signing in instead.`;
  }

  return "";
}

function renderAfterAuthChange() {
  synchronizeAuthSession();
  applyActiveAccountTheme();
  renderAuthNav();
  if (hasDashboard()) {
    renderDashboard();
  }
  if (hasCustomerWorkspace()) {
    renderCustomerWorkspace();
  }
  if (hasMechanicWorkspace()) {
    renderMechanicWorkspace();
  }
  if (hasAuthWorkspace()) {
    renderAuthWorkspace();
  }
  if (hasSettingsWorkspace()) {
    renderSettingsWorkspace();
  }
  if (elements.mechanicGrid || hasCommandCenter()) {
    renderMechanics();
  }
}

function renderAuthWorkspace() {
  if (!hasAuthWorkspace()) {
    return;
  }

  renderAuthSessionCard();
  syncAuthPanels();
  refreshInteractiveSurfaces();
}

function renderAuthSessionCard() {
  const activeAccount = getActiveAuthAccount();
  const customerAccountCount = state.authAccounts.filter((account) => account.role === "customer").length;
  const mechanicAccountCount = state.authAccounts.filter((account) => account.role === "mechanic").length;

  if (elements.customerAccountCount) {
    elements.customerAccountCount.textContent = `${customerAccountCount} customer account${
      customerAccountCount === 1 ? "" : "s"
    }`;
  }

  if (elements.mechanicAccountCount) {
    elements.mechanicAccountCount.textContent = `${mechanicAccountCount} mechanic account${
      mechanicAccountCount === 1 ? "" : "s"
    }`;
  }

  if (elements.sessionStatus) {
    elements.sessionStatus.textContent = activeAccount ? "Signed in" : "Signed out";
  }

  if (elements.sessionRoleLabel) {
    elements.sessionRoleLabel.textContent = activeAccount
      ? `${titleCase(activeAccount.role)} access is active`
      : "Choose customer or mechanic access";
  }

  if (elements.sessionCoverageLabel) {
    elements.sessionCoverageLabel.textContent = activeAccount
      ? getSignedInCoverageLabel(activeAccount)
      : "Sign in to connect MechGo to a saved customer or mechanic workspace.";
  }

  if (elements.sessionName) {
    elements.sessionName.textContent = activeAccount
      ? formatSignedInLabel(activeAccount)
      : "No MechGo account signed in";
  }

  if (elements.sessionMeta) {
    elements.sessionMeta.textContent = activeAccount
      ? activeAccount.role === "customer"
        ? `Customer profile ${formatCustomerHandle(activeAccount.username)} is ready for quicker roadside booking and billing.`
        : `Mechanic profile ${formatMechanicHandle(activeAccount.username)} is ready for dispatch visibility and operator setup.`
      : "Create a MechGo account as a customer or mechanic, or sign in to an existing demo account stored on this device.";
  }

  if (elements.sessionDestinationLink) {
    elements.sessionDestinationLink.href = activeAccount
      ? "dashboard.html"
      : "index.html";
    elements.sessionDestinationLink.textContent = activeAccount
      ? "Open dashboard"
      : "Return home";
  }

  if (elements.signOutButton) {
    elements.signOutButton.disabled = !activeAccount;
  }
}

function renderDashboard() {
  const activeAccount = getActiveAuthAccount();
  const activeCustomer = getActiveCustomerProfile();
  const activeMechanic = getActiveMechanicProfile();
  const pendingRedirect = state.postAuthRedirect || loadPostAuthRedirect();
  const accountSettings = activeAccount
    ? getNormalizedAccountSettings(activeAccount)
    : buildDefaultAccountSettings(null);
  const signedInHandle = activeAccount ? formatSignedInLabel(activeAccount) : "@guest";
  const themeLabel = getThemeModeLabel(accountSettings.themeMode);

  if (elements.dashboardRoleBadge) {
    elements.dashboardRoleBadge.textContent = activeAccount
      ? `${titleCase(activeAccount.role)} ${signedInHandle}`
      : "Guest session";
  }

  if (elements.dashboardGreeting) {
    elements.dashboardGreeting.textContent = activeAccount
      ? `Welcome back, ${signedInHandle}.`
      : "Sign in to unlock the MechGo dashboard.";
  }

  if (elements.dashboardSessionMeta) {
    elements.dashboardSessionMeta.textContent = activeAccount
      ? activeAccount.role === "customer"
        ? `${activeAccount.displayName || "Your customer account"} is live, and your roadside profile is ready for booking, billing, and support.`
        : `${activeAccount.displayName || "Your mechanic account"} is live, and your operator profile is ready for dispatch, payment receiving, and support.`
      : "Use the MechGo sign-in portal to access customer bookings, mechanic operations, saved legal docs, and support tools.";
  }

  if (elements.dashboardPendingNotice) {
    elements.dashboardPendingNotice.textContent =
      pendingRedirect && pendingRedirect.reason === "booking"
        ? "You were asked to sign in before booking. Jump back into the marketplace whenever you're ready."
        : pendingRedirect && pendingRedirect.reason === "restricted"
          ? "This part of MechGo is protected. Sign in first, then open the requested workspace from your dashboard."
          : pendingRedirect && pendingRedirect.reason === "mechanic-only"
            ? "Verification and document review live inside the mechanic side of MechGo."
            : "Your saved workspaces, support options, and legal references live here after sign-in.";
  }

  if (elements.dashboardContinueLink) {
    elements.dashboardContinueLink.href = pendingRedirect && pendingRedirect.path
      ? pendingRedirect.path
      : activeAccount
        ? "marketplace.html"
        : "signin.html";
    elements.dashboardContinueLink.textContent = pendingRedirect && pendingRedirect.reason === "booking"
      ? "Continue booking"
      : pendingRedirect && pendingRedirect.reason === "restricted"
        ? "Open requested page"
        : pendingRedirect && pendingRedirect.reason === "mechanic-only"
          ? "Open mechanic workspace"
      : activeAccount
        ? "Open marketplace"
        : "Sign in";
  }

  if (elements.dashboardAccountHandle) {
    elements.dashboardAccountHandle.textContent = activeAccount ? signedInHandle : "@account";
  }

  if (elements.dashboardAccountEmail) {
    elements.dashboardAccountEmail.textContent = activeAccount
      ? activeAccount.email
      : "Sign in to load your saved email and dashboard settings.";
  }

  if (elements.dashboardAccountMeta) {
    elements.dashboardAccountMeta.textContent = activeAccount
      ? `${activeAccount.displayName || titleCase(activeAccount.role)} profile | Use settings to change your email, password, appearance mode, and verification status.`
      : "Sign in to manage your password, account email, appearance mode, and notification settings.";
  }

  if (elements.dashboardThemeStatus) {
    elements.dashboardThemeStatus.textContent = activeAccount
      ? `${themeLabel} active`
      : "Dark mode default";
  }

  if (elements.dashboardThemeToggle) {
    elements.dashboardThemeToggle.disabled = !activeAccount;
    elements.dashboardThemeToggle.textContent = activeAccount
      ? accountSettings.themeMode === "light"
        ? "Switch to dark"
        : "Switch to light"
      : "Theme locked";
  }

  if (elements.dashboardCustomerStatus) {
    elements.dashboardCustomerStatus.textContent = activeCustomer ? "Customer workspace ready" : "No customer profile yet";
  }

  if (elements.dashboardCustomerName) {
    elements.dashboardCustomerName.textContent = activeCustomer
      ? `${activeCustomer.fullName} ${formatCustomerHandle(activeCustomer.username)}`
      : "Create a customer workspace";
  }

  if (elements.dashboardCustomerMeta) {
    elements.dashboardCustomerMeta.textContent = activeCustomer
      ? `${activeCustomer.homeCity} | ${activeCustomer.vehicle} | ${getMembershipPlanLabel(
          activeCustomer.membershipTier
        )}`
      : "Set up personal details, address, vehicles, payment methods, and roadside preferences.";
  }

  if (elements.dashboardCustomerLink) {
    elements.dashboardCustomerLink.href = activeAccount
      ? "customers.html"
      : "signin.html?role=customer&mode=create";
    elements.dashboardCustomerLink.textContent = activeCustomer
      ? "Open customer page"
      : activeAccount
        ? "Create customer page"
        : "Create customer account";
  }

  if (elements.dashboardMechanicStatus) {
    elements.dashboardMechanicStatus.textContent = activeMechanic ? "Mechanic workspace ready" : "No mechanic profile yet";
  }

  if (elements.dashboardMechanicName) {
    elements.dashboardMechanicName.textContent = activeMechanic
      ? `${activeMechanic.businessName} ${formatMechanicHandle(activeMechanic.username)}`
      : "Create a mechanic workspace";
  }

  if (elements.dashboardMechanicMeta) {
    elements.dashboardMechanicMeta.textContent = activeMechanic
      ? `${activeMechanic.baseCity} | ${activeMechanic.serviceRadiusMiles} mile radius | ${getMechanicAvailabilityLabel(
          activeMechanic.dispatchMode
        )}`
      : "Set up coverage, specialties, credentials, receiving routes, and operator readiness.";
  }

  if (elements.dashboardMechanicLink) {
    elements.dashboardMechanicLink.href = activeAccount
      ? "mechanics.html"
      : "signin.html?role=mechanic&mode=create";
    elements.dashboardMechanicLink.textContent = activeMechanic
      ? "Open mechanic page"
      : activeAccount
        ? "Create mechanic page"
        : "Create mechanic account";
  }
}

function resumePendingBookingIfNeeded() {
  const pendingRedirect = state.postAuthRedirect || loadPostAuthRedirect();

  if (
    state.bookingResumeHandled ||
    getCurrentPageName() !== "marketplace.html" ||
    !pendingRedirect ||
    pendingRedirect.reason !== "booking"
  ) {
    return;
  }

  state.bookingResumeHandled = true;

  const activeAccount = getActiveAuthAccount();
  if (!activeAccount || activeAccount.role !== "customer" || !pendingRedirect.mechanicId) {
    return;
  }

  const mechanic = getFilteredMechanics().find(
    (candidate) => candidate.id === pendingRedirect.mechanicId
  );

  if (!mechanic) {
    return;
  }

  openBookingModal(mechanic);
  showToast("You are signed in now. Finish the roadside booking below.");
}

function renderSettingsWorkspace() {
  const activeAccount = getActiveAuthAccount();
  if (!activeAccount) {
    return;
  }

  const accountSettings = getNormalizedAccountSettings(activeAccount);
  const phoneNumber = getAccountPhoneNumber(activeAccount);
  const signedInHandle = formatSignedInLabel(activeAccount);

  if (elements.settingsDisplayName) {
    elements.settingsDisplayName.textContent = signedInHandle;
  }

  if (elements.settingsRoleSummary) {
    elements.settingsRoleSummary.textContent = `${titleCase(activeAccount.role)} account | ${
      activeAccount.displayName || "Signed-in MechGo account"
    }`;
  }

  if (elements.settingsUsername) {
    elements.settingsUsername.value = signedInHandle;
  }

  if (elements.settingsPrimaryEmail) {
    elements.settingsPrimaryEmail.value = activeAccount.email || "";
  }

  if (elements.settingsPrimaryPhone) {
    elements.settingsPrimaryPhone.value = phoneNumber;
  }

  if (elements.settingsEmailStatus) {
    elements.settingsEmailStatus.textContent = accountSettings.emailVerified
      ? "Verified email on file"
      : "Email verification pending";
  }

  if (elements.settingsPhoneStatus) {
    elements.settingsPhoneStatus.textContent = accountSettings.phoneVerified
      ? "Verified phone on file"
      : phoneNumber
        ? "Phone verification pending"
        : "No phone number linked yet";
  }

  if (elements.settingsSecurityStatus) {
    elements.settingsSecurityStatus.textContent = accountSettings.twoFactorEnabled
      ? "Two-step verification enabled"
      : "Two-step verification off";
  }

  if (elements.settingsSharingStatus) {
    elements.settingsSharingStatus.textContent = accountSettings.locationSharingEnabled
      ? "Dispatch location sharing enabled"
      : "Manual location sharing only";
  }

  if (elements.settingsRecoveryEmail) {
    elements.settingsRecoveryEmail.value = accountSettings.recoveryEmail || "";
  }

  if (elements.settingsEmergencyContact) {
    elements.settingsEmergencyContact.value = accountSettings.emergencyContact || "";
  }

  if (elements.settingsThemeMode) {
    elements.settingsThemeMode.value = accountSettings.themeMode === "light" ? "light" : "dark";
  }

  if (elements.settingsTwoFactor) {
    elements.settingsTwoFactor.checked = Boolean(accountSettings.twoFactorEnabled);
  }

  if (elements.settingsLocationSharing) {
    elements.settingsLocationSharing.checked = Boolean(accountSettings.locationSharingEnabled);
  }

  if (elements.settingsSmsAlerts) {
    elements.settingsSmsAlerts.checked = Boolean(accountSettings.smsAlertsEnabled);
  }

  if (elements.settingsEmailReceipts) {
    elements.settingsEmailReceipts.checked = Boolean(accountSettings.emailReceiptsEnabled);
  }

  if (elements.settingsMarketing) {
    elements.settingsMarketing.checked = Boolean(accountSettings.marketingOptIn);
  }

  if (elements.verifyEmailButton) {
    elements.verifyEmailButton.disabled = Boolean(accountSettings.emailVerified);
  }

  if (elements.verifyPhoneButton) {
    elements.verifyPhoneButton.disabled = Boolean(accountSettings.phoneVerified) || !phoneNumber;
  }
}

function handleSettingsSubmit(event) {
  event.preventDefault();

  if (
    !elements.settingsRecoveryEmail ||
    !elements.settingsEmergencyContact ||
    !elements.settingsThemeMode ||
    !elements.settingsTwoFactor ||
    !elements.settingsLocationSharing ||
    !elements.settingsSmsAlerts ||
    !elements.settingsEmailReceipts ||
    !elements.settingsMarketing
  ) {
    return;
  }

  const recoveryEmail = elements.settingsRecoveryEmail.value.trim();
  const normalizedRecoveryEmail = recoveryEmail ? normalizeEmail(recoveryEmail) : "";

  if (recoveryEmail && !normalizedRecoveryEmail.includes("@")) {
    showToast("Enter a valid recovery email before saving settings.");
    return;
  }

  updateActiveAccountSettings({
    recoveryEmail: normalizedRecoveryEmail,
    emergencyContact: elements.settingsEmergencyContact.value.trim(),
    themeMode: elements.settingsThemeMode.value === "light" ? "light" : "dark",
    twoFactorEnabled: elements.settingsTwoFactor.checked,
    locationSharingEnabled: elements.settingsLocationSharing.checked,
    smsAlertsEnabled: elements.settingsSmsAlerts.checked,
    emailReceiptsEnabled: elements.settingsEmailReceipts.checked,
    marketingOptIn: elements.settingsMarketing.checked,
  });
  renderAfterAuthChange();
  showToast("Saved your MechGo account settings.");
}

function handleEmailChangeSubmit(event) {
  event.preventDefault();

  if (!elements.settingsNewEmail || !elements.settingsConfirmEmail) {
    return;
  }

  const activeAccount = getActiveAuthAccount();
  if (!activeAccount) {
    return;
  }

  const nextEmail = normalizeEmail(elements.settingsNewEmail.value);
  const confirmEmail = normalizeEmail(elements.settingsConfirmEmail.value);
  const currentEmail = normalizeEmail(activeAccount.email);

  if (!nextEmail || !nextEmail.includes("@")) {
    showToast("Enter a valid new email address before saving it.");
    return;
  }

  if (nextEmail !== confirmEmail) {
    showToast("The new email entries do not match yet.");
    return;
  }

  if (nextEmail === currentEmail) {
    showToast("That email is already tied to this MechGo account.");
    return;
  }

  if (isRoleEmailTaken(activeAccount.role, nextEmail, activeAccount.id)) {
    showToast(`That email already has a ${activeAccount.role} account in MechGo.`);
    return;
  }

  const currentSettings = getNormalizedAccountSettings(activeAccount);
  updateLinkedProfileEmail(activeAccount, nextEmail);
  updateActiveAuthAccount({
    email: nextEmail,
  });
  updateActiveAccountSettings({
    emailVerified: false,
    emailVerifiedAt: "",
    recoveryEmail: currentSettings.recoveryEmail === currentEmail ? nextEmail : currentSettings.recoveryEmail,
  });

  elements.emailChangeForm.reset();
  renderAfterAuthChange();
  showToast("Updated your MechGo account email. Verify the new address when you are ready.");
}

function handlePasswordChangeSubmit(event) {
  event.preventDefault();

  if (
    !elements.settingsCurrentPassword ||
    !elements.settingsNewPassword ||
    !elements.settingsConfirmPassword
  ) {
    return;
  }

  const activeAccount = getActiveAuthAccount();
  if (!activeAccount) {
    return;
  }

  const currentPassword = elements.settingsCurrentPassword.value.trim();
  const nextPassword = elements.settingsNewPassword.value.trim();
  const confirmPassword = elements.settingsConfirmPassword.value.trim();

  if (currentPassword !== activeAccount.password) {
    showToast("Your current password does not match this MechGo account.");
    return;
  }

  if (currentPassword === nextPassword) {
    showToast("Choose a new password instead of reusing the current one.");
    return;
  }

  if (!validateAccountPassword(nextPassword, confirmPassword)) {
    return;
  }

  updateActiveAuthAccount({
    password: nextPassword,
  });
  elements.passwordChangeForm.reset();
  renderAfterAuthChange();
  showToast("Updated your MechGo password for this device.");
}

function handleDashboardThemeToggle() {
  const activeAccount = getActiveAuthAccount();
  if (!activeAccount) {
    return;
  }

  const accountSettings = getNormalizedAccountSettings(activeAccount);
  const nextThemeMode = accountSettings.themeMode === "light" ? "dark" : "light";
  updateActiveAccountSettings({
    themeMode: nextThemeMode,
  });
  renderAfterAuthChange();
  showToast(`${getThemeModeLabel(nextThemeMode)} enabled for this MechGo account.`);
}

function handleVerifyEmail() {
  const activeAccount = getActiveAuthAccount();
  if (!activeAccount) {
    return;
  }

  updateActiveAccountSettings({
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
  });
  renderAfterAuthChange();
  showToast(`Verified the email for ${activeAccount.email}.`);
}

function handleVerifyPhone() {
  const activeAccount = getActiveAuthAccount();
  if (!activeAccount) {
    return;
  }

  const phoneNumber = getAccountPhoneNumber(activeAccount);
  if (!phoneNumber) {
    showToast("Add a phone number to the linked profile before verifying it.");
    return;
  }

  updateActiveAccountSettings({
    phoneVerified: true,
    phoneVerifiedAt: new Date().toISOString(),
  });
  renderAfterAuthChange();
  showToast("Verified the phone number tied to this MechGo account.");
}

function handleProblemReportSubmit(event) {
  event.preventDefault();

  if (
    !elements.problemReportForm ||
    !elements.reportName ||
    !elements.reportEmail ||
    !elements.reportUserType ||
    !elements.reportCategory ||
    !elements.reportSubject ||
    !elements.reportSeverity ||
    !elements.reportDescription ||
    !elements.reportContactMethod
  ) {
    return;
  }

  const activeAccount = getActiveAuthAccount();
  const reportEntry = {
    id: `issue-${Date.now()}`,
    name: elements.reportName.value.trim(),
    email: normalizeEmail(elements.reportEmail.value),
    userType: elements.reportUserType.value,
    category: elements.reportCategory.value,
    subject: elements.reportSubject.value.trim(),
    bookingId: elements.reportBookingId ? elements.reportBookingId.value.trim() : "",
    severity: elements.reportSeverity.value,
    description: elements.reportDescription.value.trim(),
    contactMethod: elements.reportContactMethod.value,
    status: "Received",
    createdAt: new Date().toISOString(),
    accountId: activeAccount ? activeAccount.id : "",
  };

  if (!reportEntry.name || !reportEntry.email || !reportEntry.subject || !reportEntry.description) {
    showToast("Complete the support form before sending the report.");
    return;
  }

  state.supportReports = [reportEntry, ...state.supportReports].slice(0, 30);
  persistSupportReports();
  elements.problemReportForm.reset();
  syncProblemReportDefaults();
  renderSupportWorkspace();
  showToast("Your MechGo problem report was submitted to the support queue.");
}

function renderSupportWorkspace() {
  syncProblemReportDefaults();

  if (!elements.reportList || !elements.reportCount || !elements.reportTemplate) {
    return;
  }

  elements.reportList.innerHTML = "";
  elements.reportCount.textContent = `${state.supportReports.length} report${
    state.supportReports.length === 1 ? "" : "s"
  }`;

  if (!state.supportReports.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "No support reports yet. Use the form above to flag booking issues, app bugs, billing problems, or safety concerns.";
    elements.reportList.appendChild(emptyState);
    refreshInteractiveSurfaces();
    return;
  }

  state.supportReports.forEach((reportEntry) => {
    const card = elements.reportTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector(".report-card-status").textContent = reportEntry.status;
    card.querySelector(".report-card-title").textContent = reportEntry.subject;
    card.querySelector(".report-card-meta").textContent =
      `${titleCase(reportEntry.category)} | ${titleCase(reportEntry.severity)} | ${formatSubmissionTime(
        reportEntry.createdAt
      )}`;
    card.querySelector(".report-card-contact").textContent =
      `${reportEntry.name} | ${reportEntry.email} | ${titleCase(reportEntry.userType)}`;
    card.querySelector(".report-card-body").textContent = reportEntry.description;
    card.querySelector(".report-card-ticket").textContent = reportEntry.bookingId
      ? `Booking reference: ${reportEntry.bookingId}`
      : "No booking reference attached.";
    elements.reportList.appendChild(card);
  });

  refreshInteractiveSurfaces();
}

function syncProblemReportDefaults() {
  const activeAccount = getActiveAuthAccount();
  const activeCustomer = getActiveCustomerProfile();
  const activeMechanic = getActiveMechanicProfile();

  if (elements.reportName && !elements.reportName.value.trim()) {
    elements.reportName.value = activeAccount
      ? activeAccount.displayName || ""
      : "";
  }

  if (elements.reportEmail && !elements.reportEmail.value.trim()) {
    elements.reportEmail.value = activeAccount ? activeAccount.email || "" : "";
  }

  if (elements.reportUserType) {
    if (activeAccount) {
      elements.reportUserType.value = activeAccount.role;
    } else if (!elements.reportUserType.value) {
      elements.reportUserType.value = "customer";
    }
  }

  if (elements.reportBookingId && !elements.reportBookingId.value.trim()) {
    const latestBooking = state.bookings[0];
    if (latestBooking && activeCustomer && latestBooking.customerId === activeCustomer.id) {
      elements.reportBookingId.value = latestBooking.id;
    }
    if (latestBooking && activeMechanic && latestBooking.mechanicId === activeMechanic.id) {
      elements.reportBookingId.value = latestBooking.id;
    }
  }
}

function openLegalModal(panelName) {
  if (!elements.legalModal || !elements.legalModalTitle || !elements.legalModalBody) {
    return;
  }

  const sourcePanel = elements.termsPanels.find((panel) => panel.dataset.termsPanel === panelName);
  if (!sourcePanel) {
    return;
  }

  const clonedPanel = sourcePanel.cloneNode(true);
  clonedPanel.hidden = false;
  clonedPanel.classList.add("is-active");
  clonedPanel.querySelectorAll("[data-legal-open]").forEach((button) => button.remove());

  const heading = clonedPanel.querySelector("h3");
  elements.legalModalTitle.textContent = heading ? heading.textContent : "Legal document";
  elements.legalModalBody.innerHTML = "";

  Array.from(clonedPanel.children).forEach((child) => {
    elements.legalModalBody.appendChild(child);
  });

  elements.legalModal.classList.remove("hidden");
  elements.legalModal.setAttribute("aria-hidden", "false");
}

function closeLegalModal() {
  if (!elements.legalModal) {
    return;
  }

  elements.legalModal.classList.add("hidden");
  elements.legalModal.setAttribute("aria-hidden", "true");
}

function setSignedInAccount(account) {
  state.authSession = {
    accountId: account.id,
    role: account.role,
    username: account.username,
    profileId: account.profileId || "",
    signedInAt: new Date().toISOString(),
  };
  persistAuthSession();
  synchronizeAuthSession();
}

function clearAuthSession() {
  state.authSession = null;
  persistAuthSession();
}

function synchronizeAuthSession() {
  const activeAccount = getActiveAuthAccount();
  if (!activeAccount) {
    if (state.authSession && state.authSession.accountId) {
      clearAuthSession();
    }
    return;
  }

  let resolvedProfileId = activeAccount.profileId || "";
  let accountWasUpdated = false;

  if (activeAccount.role === "customer") {
    const matchedProfile = resolveCustomerProfileForAccount(activeAccount);
    if (matchedProfile) {
      resolvedProfileId = matchedProfile.id;
      state.activeCustomerId = matchedProfile.id;
      persistActiveCustomerId();
    }
  } else {
    const matchedProfile = resolveMechanicProfileForAccount(activeAccount);
    if (matchedProfile) {
      resolvedProfileId = matchedProfile.id;
      state.activeMechanicId = matchedProfile.id;
      persistActiveMechanicId();
    }
  }

  if (resolvedProfileId && resolvedProfileId !== activeAccount.profileId) {
    state.authAccounts = state.authAccounts.map((account) =>
      account.id === activeAccount.id
        ? {
            ...account,
            profileId: resolvedProfileId,
            updatedAt: new Date().toISOString(),
          }
        : account
    );
    persistAuthAccounts();
    accountWasUpdated = true;
  }

  const refreshedAccount = accountWasUpdated ? getActiveAuthAccount() : activeAccount;
  state.authSession = {
    accountId: refreshedAccount.id,
    role: refreshedAccount.role,
    username: refreshedAccount.username,
    profileId: refreshedAccount.profileId || resolvedProfileId || "",
    signedInAt:
      state.authSession && state.authSession.signedInAt
        ? state.authSession.signedInAt
        : new Date().toISOString(),
  };
  persistAuthSession();
}

function getActiveAuthAccount() {
  if (!state.authSession || !state.authSession.accountId) {
    return null;
  }

  return state.authAccounts.find((account) => account.id === state.authSession.accountId) || null;
}

function buildDefaultAccountSettings(account) {
  return {
    emailVerified: false,
    phoneVerified: false,
    recoveryEmail: account && account.email ? account.email : "",
    emergencyContact: "",
    themeMode: "dark",
    twoFactorEnabled: false,
    locationSharingEnabled: true,
    smsAlertsEnabled: true,
    emailReceiptsEnabled: true,
    marketingOptIn: false,
    updatedAt: new Date().toISOString(),
  };
}

function getNormalizedAccountSettings(account) {
  const defaultSettings = buildDefaultAccountSettings(account);
  const savedSettings =
    account && account.settings && typeof account.settings === "object" ? account.settings : {};

  return {
    ...defaultSettings,
    ...savedSettings,
  };
}

function getAccountPhoneNumber(account) {
  if (!account) {
    return "";
  }

  const linkedProfile =
    account.role === "customer"
      ? resolveCustomerProfileForAccount(account)
      : resolveMechanicProfileForAccount(account);

  return linkedProfile && linkedProfile.phone ? linkedProfile.phone : "";
}

function updateActiveAccountSettings(partialSettings) {
  const activeAccount = getActiveAuthAccount();
  if (!activeAccount) {
    return null;
  }

  const nextSettings = {
    ...getNormalizedAccountSettings(activeAccount),
    ...partialSettings,
    updatedAt: new Date().toISOString(),
  };

  state.authAccounts = state.authAccounts.map((account) =>
    account.id === activeAccount.id
      ? {
          ...account,
          settings: nextSettings,
          updatedAt: new Date().toISOString(),
        }
      : account
  );
  persistAuthAccounts();
  synchronizeAuthSession();
  return getActiveAuthAccount();
}

function updateActiveAuthAccount(partialAccount) {
  const activeAccount = getActiveAuthAccount();
  if (!activeAccount) {
    return null;
  }

  state.authAccounts = state.authAccounts.map((account) =>
    account.id === activeAccount.id
      ? {
          ...account,
          ...partialAccount,
          updatedAt: new Date().toISOString(),
        }
      : account
  );
  persistAuthAccounts();
  synchronizeAuthSession();
  return getActiveAuthAccount();
}

function isRoleEmailTaken(role, email, excludedAccountId = "") {
  return state.authAccounts.some(
    (account) =>
      account.id !== excludedAccountId &&
      account.role === role &&
      normalizeEmail(account.email) === normalizeEmail(email)
  );
}

function updateLinkedProfileEmail(account, nextEmail) {
  if (!account || !nextEmail) {
    return;
  }

  const timestamp = new Date().toISOString();

  if (account.role === "customer") {
    const linkedProfile = resolveCustomerProfileForAccount(account);
    if (!linkedProfile) {
      return;
    }

    state.customerProfiles = state.customerProfiles.map((profile) =>
      profile.id === linkedProfile.id
        ? {
            ...profile,
            email: nextEmail,
            updatedAt: timestamp,
          }
        : profile
    );
    persistCustomerProfiles();
    return;
  }

  const linkedProfile = resolveMechanicProfileForAccount(account);
  if (!linkedProfile) {
    return;
  }

  state.mechanicProfiles = state.mechanicProfiles.map((profile) =>
    profile.id === linkedProfile.id
      ? {
          ...profile,
          email: nextEmail,
          updatedAt: timestamp,
        }
      : profile
  );
  persistMechanicProfiles();
}

function findAuthAccount(role, identifier) {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const normalizedUsername = normalizeUsername(identifier);
  return (
    state.authAccounts.find(
      (account) =>
        account.role === role &&
        (normalizeEmail(account.email) === normalizedIdentifier || account.username === normalizedUsername)
    ) || null
  );
}

function mapApiUserToAuthAccount(user, role) {
  const username = normalizeUsername(user.username);
  const email = normalizeEmail(user.email);
  const profile =
    role === "customer"
      ? resolveCustomerProfileByIdentity(username, email)
      : resolveMechanicProfileByIdentity(username, email);

  return {
    id: user.id,
    role,
    username,
    email,
    password: "",
    profileId: profile ? profile.id : "",
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };
}

function resolveCustomerProfileByIdentity(username, email) {
  return (
    state.customerProfiles.find((profile) => profile.username === username) ||
    state.customerProfiles.find((profile) => normalizeEmail(profile.email) === email) ||
    null
  );
}

function resolveMechanicProfileByIdentity(username, email) {
  return (
    state.mechanicProfiles.find((profile) => profile.username === username) ||
    state.mechanicProfiles.find((profile) => normalizeEmail(profile.email) === email) ||
    null
  );
}

function resolveCustomerProfileForAccount(account) {
  return (
    state.customerProfiles.find((profile) => profile.id === account.profileId) ||
    resolveCustomerProfileByIdentity(account.username, normalizeEmail(account.email)) ||
    null
  );
}

function resolveMechanicProfileForAccount(account) {
  return (
    state.mechanicProfiles.find((profile) => profile.id === account.profileId) ||
    resolveMechanicProfileByIdentity(account.username, normalizeEmail(account.email)) ||
    null
  );
}

function getSignedInCoverageLabel(account) {
  if (account.role === "customer") {
    const profile = resolveCustomerProfileForAccount(account);
    return profile
      ? `${profile.homeCity} customer profile linked with ${profile.vehicle}.`
      : "Customer workspace linked locally on this device.";
  }

  const profile = resolveMechanicProfileForAccount(account);
  return profile
    ? `${profile.baseCity} mechanic profile linked for ${titleCase(
        (profile.specialties && profile.specialties[0]) || "diagnostic"
      )} dispatches.`
    : "Mechanic workspace linked locally on this device.";
}

function syncAuthAccountFromProfile(role, profile) {
  if (!profile) {
    return;
  }

  let hasChanges = false;
  state.authAccounts = state.authAccounts.map((account) => {
    if (account.role !== role || account.profileId !== profile.id) {
      return account;
    }

    hasChanges = true;
    return {
      ...account,
      username: profile.username,
      email: profile.email,
      displayName: role === "customer" ? profile.fullName : profile.businessName,
      updatedAt: new Date().toISOString(),
    };
  });

  if (hasChanges) {
    persistAuthAccounts();
    if (state.authSession && state.authSession.role === role && state.authSession.profileId === profile.id) {
      synchronizeAuthSession();
    }
  }
}

function handleCustomerProfileSubmit(event) {
  event.preventDefault();

  if (
    !elements.customerProfileForm ||
    !elements.accountFullName ||
    !elements.accountUsername ||
    !elements.accountEmail ||
    !elements.accountPhone ||
    !elements.accountHomeCity ||
    !elements.accountAddress ||
    !elements.accountPreferredContact ||
    !elements.accountVehicle ||
    !elements.accountSecondaryVehicle ||
    !elements.accountPlateNumber ||
    !elements.accountRoadsideNotes ||
    !elements.accountTier ||
    !elements.accountServicePreference
  ) {
    return;
  }

  const editingCustomerId = elements.registeredCustomerId ? elements.registeredCustomerId.value : "";
  const normalizedUsername = normalizeUsername(elements.accountUsername.value);

  if (!normalizedUsername) {
    showToast("Choose a username using letters, numbers, dots, dashes, or underscores.");
    return;
  }

  const conflictingProfile = state.customerProfiles.find(
    (profile) => profile.username === normalizedUsername && profile.id !== editingCustomerId
  );

  if (conflictingProfile) {
    showToast("That username is already registered in this MechGo workspace.");
    return;
  }

  const normalizedEmail = normalizeEmail(elements.accountEmail.value);
  const conflictingAuthAccount = state.authAccounts.find(
    (account) =>
      (account.username === normalizedUsername || (
        account.role === "customer" && normalizeEmail(account.email) === normalizedEmail
      )) &&
      account.profileId !== editingCustomerId
  );

  if (conflictingAuthAccount) {
    showToast("That customer identity is already tied to another MechGo sign-in.");
    return;
  }

  const currentProfile = editingCustomerId
    ? state.customerProfiles.find((profile) => profile.id === editingCustomerId)
    : null;
  const timestamp = new Date().toISOString();
  const nextProfile = {
    id: currentProfile ? currentProfile.id : `cust-${Date.now()}`,
    fullName: elements.accountFullName.value.trim(),
    username: normalizedUsername,
    email: elements.accountEmail.value.trim(),
    phone: elements.accountPhone.value.trim(),
    homeCity: elements.accountHomeCity.value.trim() || state.city || "Austin, TX",
    address: elements.accountAddress.value.trim(),
    preferredContact: elements.accountPreferredContact.value,
    vehicle: elements.accountVehicle.value.trim(),
    secondaryVehicle: elements.accountSecondaryVehicle.value.trim(),
    plateNumber: elements.accountPlateNumber.value.trim(),
    roadsideNotes: elements.accountRoadsideNotes.value.trim(),
    membershipTier: elements.accountTier.value,
    servicePreference: elements.accountServicePreference.value,
    joinedAt: currentProfile ? currentProfile.joinedAt : timestamp,
    updatedAt: timestamp,
    paymentMethods: currentProfile ? currentProfile.paymentMethods || [] : [],
  };

  state.customerProfiles = currentProfile
    ? state.customerProfiles.map((profile) =>
        profile.id === nextProfile.id ? nextProfile : profile
      )
    : [nextProfile, ...state.customerProfiles].slice(0, 12);

  state.activeCustomerId = nextProfile.id;
  persistCustomerProfiles();
  persistActiveCustomerId();
  syncAuthAccountFromProfile("customer", nextProfile);
  clearCustomerProfileForm();
  renderCustomerWorkspace();
  renderAuthNav();
  showToast(
    currentProfile
      ? `Updated @${nextProfile.username} and made this the active customer.`
      : `Registered @${nextProfile.username} in the customer area.`
  );
}

function handlePaymentMethodSubmit(event) {
  event.preventDefault();

  if (
    !elements.paymentMethodForm ||
    !elements.paymentMethodType ||
    !elements.paymentMethodLabel ||
    !elements.paymentMethodLastFour ||
    !elements.paymentMethodExpiry ||
    !elements.paymentMethodZip ||
    !elements.paymentMethodDefault
  ) {
    return;
  }

  const activeCustomer = getActiveCustomerProfile();
  if (!activeCustomer) {
    showToast("Create or select a customer profile before saving payment methods.");
    return;
  }

  const lastFour = elements.paymentMethodLastFour.value.trim();
  if (!/^\d{4}$/.test(lastFour)) {
    showToast("Enter the last four digits for the payment method.");
    return;
  }

  const paymentMethods = activeCustomer.paymentMethods || [];
  const shouldBeDefault = elements.paymentMethodDefault.checked || !paymentMethods.length;
  const paymentMethod = {
    id: `pay-${Date.now()}`,
    type: elements.paymentMethodType.value,
    label:
      elements.paymentMethodLabel.value.trim() ||
      `${getPaymentTypeLabel(elements.paymentMethodType.value)} ending in ${lastFour}`,
    lastFour,
    expiry: elements.paymentMethodExpiry.value.trim(),
    zip: elements.paymentMethodZip.value.trim(),
    isDefault: shouldBeDefault,
    addedAt: new Date().toISOString(),
  };

  const nextPaymentMethods = shouldBeDefault
    ? [paymentMethod, ...paymentMethods.map((method) => ({ ...method, isDefault: false }))]
    : [paymentMethod, ...paymentMethods];

  updateCustomerPaymentMethods(activeCustomer.id, nextPaymentMethods);
  resetPaymentMethodForm();
  renderCustomerWorkspace();
  showToast(`Saved ${paymentMethod.label} for @${activeCustomer.username}.`);
}

function renderCustomerWorkspace() {
  synchronizeActiveCustomerSelection();
  renderCustomerProfiles();
  renderActiveCustomerWorkspace();
  renderPaymentMethods();
  syncCustomerProfileForm();
}

function renderCustomerProfiles() {
  if (!elements.customerDirectory || !elements.customerCount || !elements.customerTemplate) {
    return;
  }

  elements.customerDirectory.innerHTML = "";
  elements.customerCount.textContent = `${state.customerProfiles.length} customer${
    state.customerProfiles.length === 1 ? "" : "s"
  }`;

  if (!state.customerProfiles.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "No registered customers yet. Create the first customer profile to unlock account storage and saved billing.";
    elements.customerDirectory.appendChild(emptyState);
    refreshInteractiveSurfaces();
    return;
  }

  state.customerProfiles.forEach((profile) => {
    const card = elements.customerTemplate.content.firstElementChild.cloneNode(true);
    const defaultPaymentMethod = getDefaultPaymentMethod(profile);
    const isActiveCustomer = profile.id === state.activeCustomerId;

    card.querySelector(".customer-card-status").textContent = isActiveCustomer
      ? "Active customer"
      : "Registered customer";
    card.querySelector(".customer-card-name").textContent = profile.fullName;
    card.querySelector(".customer-card-handle").textContent = formatCustomerHandle(profile.username);
    card.querySelector(".customer-card-home").textContent =
      `${profile.homeCity} | ${getMembershipPlanLabel(profile.membershipTier)}`;
    card.querySelector(".customer-card-contact").textContent =
      `${profile.email} | ${profile.phone}`;
    card.querySelector(".customer-card-plan").textContent =
      `Preferred service: ${titleCase(profile.servicePreference || "battery")} | ${
        profile.address || "Address not saved"
      }`;
    card.querySelector(".customer-card-payment").textContent = defaultPaymentMethod
      ? `Default billing: ${formatPaymentMethodLabel(defaultPaymentMethod)}`
      : `No payment method saved yet.${profile.secondaryVehicle ? ` Backup vehicle: ${profile.secondaryVehicle}` : ""}`;

    const selectButton = card.querySelector(".customer-select-button");
    const editButton = card.querySelector(".customer-edit-button");
    selectButton.textContent = isActiveCustomer ? "Active now" : "Set active";
    selectButton.disabled = isActiveCustomer;
    selectButton.addEventListener("click", () => {
      state.activeCustomerId = profile.id;
      persistActiveCustomerId();
      renderCustomerWorkspace();
      showToast(`Switched the active customer to ${formatCustomerHandle(profile.username)}.`);
    });
    editButton.addEventListener("click", () => {
      populateCustomerProfileForm(profile);
      showToast(`Editing ${formatCustomerHandle(profile.username)}.`);
    });

    elements.customerDirectory.appendChild(card);
  });

  refreshInteractiveSurfaces();
}

function renderActiveCustomerWorkspace() {
  const activeCustomer = getActiveCustomerProfile();
  const defaultPaymentMethod = getDefaultPaymentMethod(activeCustomer);

  if (elements.paymentMethodForm) {
    elements.paymentMethodForm
      .querySelectorAll("input, select, button")
      .forEach((field) => {
        field.disabled = !activeCustomer;
      });
  }

  if (elements.paymentCustomerTag) {
    elements.paymentCustomerTag.textContent = activeCustomer
      ? `Saving payment methods for ${formatCustomerHandle(activeCustomer.username)}`
      : "Select a customer to unlock saved billing";
  }

  if (elements.paymentHint) {
    elements.paymentHint.textContent = activeCustomer
      ? "Saved payment methods can be used as the default billing profile during booking."
      : "Register or activate a customer profile first so MechGo knows who owns the billing wallet.";
  }

  if (!hasCustomerWorkspace()) {
    return;
  }

  if (!activeCustomer) {
    if (elements.customerAccountBadge) {
      elements.customerAccountBadge.textContent = "No active customer";
    }
    if (elements.activeCustomerName) {
      elements.activeCustomerName.textContent = "No customer selected";
    }
    if (elements.activeCustomerHandle) {
      elements.activeCustomerHandle.textContent = "@register-a-customer";
    }
    if (elements.activeCustomerSummary) {
      elements.activeCustomerSummary.textContent =
        "Create a MechGo customer account to store usernames, vehicles, and billing methods for future roadside bookings.";
    }
    if (elements.activeCustomerHome) {
      elements.activeCustomerHome.textContent = "Not set";
    }
    if (elements.activeCustomerVehicle) {
      elements.activeCustomerVehicle.textContent = "Not set";
    }
    if (elements.activeCustomerPaymentDefault) {
      elements.activeCustomerPaymentDefault.textContent = "No payment method";
    }
    if (elements.activeCustomerPlan) {
      elements.activeCustomerPlan.textContent = "Roadside Starter";
    }
    if (elements.activeCustomerContact) {
      elements.activeCustomerContact.textContent = "No contact details yet";
    }
    return;
  }

  if (elements.customerAccountBadge) {
    elements.customerAccountBadge.textContent = "Active account";
  }
  if (elements.activeCustomerName) {
    elements.activeCustomerName.textContent = activeCustomer.fullName;
  }
  if (elements.activeCustomerHandle) {
    elements.activeCustomerHandle.textContent = formatCustomerHandle(activeCustomer.username);
  }
  if (elements.activeCustomerSummary) {
    const savedMethodCount = (activeCustomer.paymentMethods || []).length;
    elements.activeCustomerSummary.textContent =
      `${activeCustomer.fullName} is ready for faster roadside checkout with ${savedMethodCount} saved payment method${
        savedMethodCount === 1 ? "" : "s"
      }, a ${getMembershipPlanLabel(activeCustomer.membershipTier)} membership tier, and ${
        activeCustomer.preferredContact || "phone"
      } as the preferred contact method.`;
  }
  if (elements.activeCustomerHome) {
    elements.activeCustomerHome.textContent = activeCustomer.address
      ? `${activeCustomer.homeCity} | ${activeCustomer.address}`
      : activeCustomer.homeCity;
  }
  if (elements.activeCustomerVehicle) {
    elements.activeCustomerVehicle.textContent = activeCustomer.plateNumber
      ? `${activeCustomer.vehicle} | Plate ${activeCustomer.plateNumber}`
      : activeCustomer.vehicle;
  }
  if (elements.activeCustomerPaymentDefault) {
    elements.activeCustomerPaymentDefault.textContent = defaultPaymentMethod
      ? formatPaymentMethodLabel(defaultPaymentMethod)
      : "No payment method";
  }
  if (elements.activeCustomerPlan) {
    elements.activeCustomerPlan.textContent = getMembershipPlanLabel(activeCustomer.membershipTier);
  }
  if (elements.activeCustomerContact) {
    elements.activeCustomerContact.textContent = `${activeCustomer.email} | ${activeCustomer.phone}${
      activeCustomer.secondaryVehicle ? ` | Backup vehicle: ${activeCustomer.secondaryVehicle}` : ""
    }${activeCustomer.roadsideNotes ? ` | Notes: ${activeCustomer.roadsideNotes}` : ""}`;
  }
}

function renderPaymentMethods() {
  if (!elements.paymentMethodList || !elements.paymentMethodCount || !elements.paymentTemplate) {
    return;
  }

  const activeCustomer = getActiveCustomerProfile();
  const paymentMethods = activeCustomer ? activeCustomer.paymentMethods || [] : [];
  elements.paymentMethodList.innerHTML = "";
  elements.paymentMethodCount.textContent = `${paymentMethods.length} method${
    paymentMethods.length === 1 ? "" : "s"
  }`;

  if (!activeCustomer) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "No active customer yet. Select a registered profile before adding saved billing methods.";
    elements.paymentMethodList.appendChild(emptyState);
    refreshInteractiveSurfaces();
    return;
  }

  if (!paymentMethods.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "No payment methods saved yet. Add a card or wallet above to enable faster customer checkout.";
    elements.paymentMethodList.appendChild(emptyState);
    refreshInteractiveSurfaces();
    return;
  }

  paymentMethods.forEach((paymentMethod) => {
    const card = elements.paymentTemplate.content.firstElementChild.cloneNode(true);

    card.querySelector(".payment-card-type").textContent = getPaymentTypeLabel(paymentMethod.type);
    card.querySelector(".payment-card-label").textContent = paymentMethod.label;
    card.querySelector(".payment-card-meta").textContent =
      `Ending in ${paymentMethod.lastFour} | Expires ${paymentMethod.expiry}`;
    card.querySelector(".payment-card-zip").textContent = `Billing ZIP ${paymentMethod.zip}`;
    card.querySelector(".payment-card-badge").textContent = paymentMethod.isDefault
      ? "Default billing"
      : "Saved method";

    const setDefaultButton = card.querySelector(".payment-set-default-button");
    const removeButton = card.querySelector(".payment-remove-button");
    setDefaultButton.disabled = paymentMethod.isDefault;
    setDefaultButton.addEventListener("click", () => {
      setDefaultPaymentMethod(paymentMethod.id);
    });
    removeButton.addEventListener("click", () => {
      removePaymentMethod(paymentMethod.id);
    });

    elements.paymentMethodList.appendChild(card);
  });

  refreshInteractiveSurfaces();
}

function populateCustomerProfileForm(profile) {
  if (
    !elements.registeredCustomerId ||
    !elements.accountFullName ||
    !elements.accountUsername ||
    !elements.accountEmail ||
    !elements.accountPhone ||
    !elements.accountHomeCity ||
    !elements.accountAddress ||
    !elements.accountPreferredContact ||
    !elements.accountVehicle ||
    !elements.accountSecondaryVehicle ||
    !elements.accountPlateNumber ||
    !elements.accountRoadsideNotes ||
    !elements.accountTier ||
    !elements.accountServicePreference
  ) {
    return;
  }

  elements.registeredCustomerId.value = profile.id;
  elements.accountFullName.value = profile.fullName;
  elements.accountUsername.value = profile.username;
  elements.accountEmail.value = profile.email;
  elements.accountPhone.value = profile.phone;
  elements.accountHomeCity.value = profile.homeCity;
  elements.accountAddress.value = profile.address || "";
  elements.accountPreferredContact.value = profile.preferredContact || "phone";
  elements.accountVehicle.value = profile.vehicle;
  elements.accountSecondaryVehicle.value = profile.secondaryVehicle || "";
  elements.accountPlateNumber.value = profile.plateNumber || "";
  elements.accountRoadsideNotes.value = profile.roadsideNotes || "";
  elements.accountTier.value = profile.membershipTier || "starter";
  elements.accountServicePreference.value = profile.servicePreference || "battery";
  setActiveProfileTab("customer-profile", "identity");
  syncCustomerProfileForm();
}

function clearCustomerProfileForm() {
  if (!elements.customerProfileForm) {
    return;
  }

  elements.customerProfileForm.reset();
  if (elements.registeredCustomerId) {
    elements.registeredCustomerId.value = "";
  }
  if (elements.accountHomeCity) {
    elements.accountHomeCity.value = state.city;
  }
  if (elements.accountAddress) {
    elements.accountAddress.value = "";
  }
  if (elements.accountPreferredContact) {
    elements.accountPreferredContact.value = "phone";
  }
  if (elements.accountSecondaryVehicle) {
    elements.accountSecondaryVehicle.value = "";
  }
  if (elements.accountPlateNumber) {
    elements.accountPlateNumber.value = "";
  }
  if (elements.accountRoadsideNotes) {
    elements.accountRoadsideNotes.value = "";
  }
  setActiveProfileTab("customer-profile", "identity");
  syncCustomerProfileForm();
}

function syncCustomerProfileForm() {
  const isEditing = Boolean(elements.registeredCustomerId && elements.registeredCustomerId.value);

  if (elements.customerFormModeLabel) {
    elements.customerFormModeLabel.textContent = isEditing
      ? "Edit active profile"
      : "Register a MechGo customer";
  }

  if (elements.customerProfileSubmitButton) {
    elements.customerProfileSubmitButton.textContent = isEditing
      ? "Update customer profile"
      : "Save customer profile";
  }
}

function synchronizeActiveCustomerSelection() {
  if (!state.customerProfiles.length) {
    state.activeCustomerId = "";
    persistActiveCustomerId();
    return;
  }

  const hasActiveCustomer = state.customerProfiles.some(
    (profile) => profile.id === state.activeCustomerId
  );

  if (!hasActiveCustomer) {
    state.activeCustomerId = state.customerProfiles[0].id;
    persistActiveCustomerId();
  }
}

function getActiveCustomerProfile() {
  if (!state.activeCustomerId) {
    return null;
  }

  return state.customerProfiles.find((profile) => profile.id === state.activeCustomerId) || null;
}

function getDefaultPaymentMethod(profile) {
  if (!profile || !profile.paymentMethods || !profile.paymentMethods.length) {
    return null;
  }

  return profile.paymentMethods.find((paymentMethod) => paymentMethod.isDefault) || profile.paymentMethods[0];
}

function updateCustomerPaymentMethods(customerId, nextPaymentMethods) {
  state.customerProfiles = state.customerProfiles.map((profile) =>
    profile.id === customerId
      ? {
          ...profile,
          paymentMethods: nextPaymentMethods,
          updatedAt: new Date().toISOString(),
        }
      : profile
  );

  persistCustomerProfiles();
}

function setDefaultPaymentMethod(paymentMethodId) {
  const activeCustomer = getActiveCustomerProfile();
  if (!activeCustomer) {
    return;
  }

  const nextPaymentMethods = (activeCustomer.paymentMethods || []).map((paymentMethod) => ({
    ...paymentMethod,
    isDefault: paymentMethod.id === paymentMethodId,
  }));

  updateCustomerPaymentMethods(activeCustomer.id, nextPaymentMethods);
  renderCustomerWorkspace();
  showToast(`Updated default billing for ${formatCustomerHandle(activeCustomer.username)}.`);
}

function removePaymentMethod(paymentMethodId) {
  const activeCustomer = getActiveCustomerProfile();
  if (!activeCustomer) {
    return;
  }

  const nextPaymentMethods = (activeCustomer.paymentMethods || []).filter(
    (paymentMethod) => paymentMethod.id !== paymentMethodId
  );

  if (nextPaymentMethods.length && !nextPaymentMethods.some((paymentMethod) => paymentMethod.isDefault)) {
    nextPaymentMethods[0] = {
      ...nextPaymentMethods[0],
      isDefault: true,
    };
  }

  updateCustomerPaymentMethods(activeCustomer.id, nextPaymentMethods);
  renderCustomerWorkspace();
  showToast(`Removed a payment method from ${formatCustomerHandle(activeCustomer.username)}.`);
}

function resetPaymentMethodForm() {
  if (!elements.paymentMethodForm) {
    return;
  }

  elements.paymentMethodForm.reset();
  if (elements.paymentMethodDefault) {
    const activeCustomer = getActiveCustomerProfile();
    elements.paymentMethodDefault.checked = !activeCustomer || !(activeCustomer.paymentMethods || []).length;
  }
}

function handleMechanicProfileSubmit(event) {
  event.preventDefault();

  if (
    !elements.mechanicProfileForm ||
    !elements.mechanicBusinessName ||
    !elements.mechanicUsername ||
    !elements.mechanicLeadName ||
    !elements.mechanicEmail ||
    !elements.mechanicPhone ||
    !elements.mechanicBaseCity ||
    !elements.mechanicBaseAddress ||
    !elements.mechanicServiceRadius ||
    !elements.mechanicBaseCallout ||
    !elements.mechanicEtaMinutes ||
    !elements.mechanicJobsCompleted ||
    !elements.mechanicDispatchMode ||
    !elements.mechanicServiceVehicle ||
    !elements.mechanicCredentialStatus ||
    !elements.mechanicCoverageNotes ||
    !elements.mechanicBio
  ) {
    return;
  }

  const selectedSpecialties = getSelectedMechanicSpecialties();
  if (!selectedSpecialties.length) {
    showToast("Select at least one specialty for the registered mechanic.");
    return;
  }

  const editingMechanicId = elements.registeredMechanicId ? elements.registeredMechanicId.value : "";
  const normalizedUsername = normalizeUsername(elements.mechanicUsername.value);
  if (!normalizedUsername) {
    showToast("Choose a mechanic username using letters, numbers, dots, dashes, or underscores.");
    return;
  }

  const conflictingProfile = state.mechanicProfiles.find(
    (profile) => profile.username === normalizedUsername && profile.id !== editingMechanicId
  );
  if (conflictingProfile) {
    showToast("That mechanic username is already registered in this MechGo workspace.");
    return;
  }

  const normalizedEmail = normalizeEmail(elements.mechanicEmail.value);
  const conflictingAuthAccount = state.authAccounts.find(
    (account) =>
      (account.username === normalizedUsername || (
        account.role === "mechanic" && normalizeEmail(account.email) === normalizedEmail
      )) &&
      account.profileId !== editingMechanicId
  );

  if (conflictingAuthAccount) {
    showToast("That mechanic identity is already tied to another MechGo sign-in.");
    return;
  }

  const currentProfile = editingMechanicId
    ? state.mechanicProfiles.find((profile) => profile.id === editingMechanicId)
    : null;
  const timestamp = new Date().toISOString();
  const baseCity = elements.mechanicBaseCity.value.trim() || state.city || "Austin, TX";
  const nextProfile = {
    id: currentProfile ? currentProfile.id : `mech-${Date.now()}`,
    businessName: elements.mechanicBusinessName.value.trim(),
    username: normalizedUsername,
    leadName: elements.mechanicLeadName.value.trim(),
    email: elements.mechanicEmail.value.trim(),
    phone: elements.mechanicPhone.value.trim(),
    baseCity,
    baseAddress: elements.mechanicBaseAddress.value.trim(),
    serviceRadiusMiles: Number(elements.mechanicServiceRadius.value) || 24,
    baseCallout: Number(elements.mechanicBaseCallout.value) || 82,
    etaMinutes: Number(elements.mechanicEtaMinutes.value) || 18,
    jobsCompleted: Number(elements.mechanicJobsCompleted.value) || 0,
    dispatchMode: elements.mechanicDispatchMode.value,
    serviceVehicle: elements.mechanicServiceVehicle.value.trim(),
    credentialStatus: elements.mechanicCredentialStatus.value.trim(),
    coverageNotes: elements.mechanicCoverageNotes.value.trim(),
    bio: elements.mechanicBio.value.trim(),
    specialties: selectedSpecialties,
    coordinates: resolveMechanicCoordinates(baseCity),
    payoutMethods: currentProfile ? currentProfile.payoutMethods || [] : [],
    rating: currentProfile ? currentProfile.rating || 4.8 : 4.8,
    joinedAt: currentProfile ? currentProfile.joinedAt : timestamp,
    updatedAt: timestamp,
  };

  state.mechanicProfiles = currentProfile
    ? state.mechanicProfiles.map((profile) =>
        profile.id === nextProfile.id ? nextProfile : profile
      )
    : [nextProfile, ...state.mechanicProfiles].slice(0, 12);

  state.activeMechanicId = nextProfile.id;
  persistMechanicProfiles();
  persistActiveMechanicId();
  syncAuthAccountFromProfile("mechanic", nextProfile);
  clearMechanicProfileForm();
  renderMechanicWorkspace();
  renderMechanics();
  renderAuthNav();
  showToast(
    currentProfile
      ? `Updated ${nextProfile.businessName} and made it the active mechanic profile.`
      : `Registered ${nextProfile.businessName} in the mechanic network.`
  );
}

function handlePayoutMethodSubmit(event) {
  event.preventDefault();

  if (
    !elements.payoutMethodForm ||
    !elements.payoutMethodType ||
    !elements.payoutMethodLabel ||
    !elements.payoutMethodLastFour ||
    !elements.payoutMethodFrequency ||
    !elements.payoutMethodDefault
  ) {
    return;
  }

  const activeMechanic = getActiveMechanicProfile();
  if (!activeMechanic) {
    showToast("Create or select a mechanic profile before saving payment receiving methods.");
    return;
  }

  const lastFour = elements.payoutMethodLastFour.value.trim();
  if (!/^\d{4}$/.test(lastFour)) {
    showToast("Enter the last four digits for the receiving method.");
    return;
  }

  const payoutMethods = activeMechanic.payoutMethods || [];
  const shouldBeDefault = elements.payoutMethodDefault.checked || !payoutMethods.length;
  const payoutMethod = {
    id: `payout-${Date.now()}`,
    type: elements.payoutMethodType.value,
    label:
      elements.payoutMethodLabel.value.trim() ||
      `${getPayoutTypeLabel(elements.payoutMethodType.value)} ending in ${lastFour}`,
    lastFour,
    frequency: elements.payoutMethodFrequency.value,
    isDefault: shouldBeDefault,
    addedAt: new Date().toISOString(),
  };

  const nextPayoutMethods = shouldBeDefault
    ? [payoutMethod, ...payoutMethods.map((method) => ({ ...method, isDefault: false }))]
    : [payoutMethod, ...payoutMethods];

  updateMechanicPayoutMethods(activeMechanic.id, nextPayoutMethods);
  resetPayoutMethodForm();
  renderMechanicWorkspace();
  showToast(`Saved payment receiving setup for ${activeMechanic.businessName}.`);
}

function renderMechanicWorkspace() {
  synchronizeActiveMechanicSelection();
  renderRegisteredMechanics();
  renderActiveMechanicWorkspace();
  renderPayoutMethods();
  syncMechanicProfileForm();
}

function renderRegisteredMechanics() {
  if (!elements.mechanicDirectory || !elements.mechanicCount || !elements.mechanicProfileTemplate) {
    return;
  }

  elements.mechanicDirectory.innerHTML = "";
  elements.mechanicCount.textContent = `${state.mechanicProfiles.length} mechanic${
    state.mechanicProfiles.length === 1 ? "" : "s"
  }`;

  if (!state.mechanicProfiles.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "No registered mechanics yet. Create the first dispatch-ready profile to populate the mechanic network.";
    elements.mechanicDirectory.appendChild(emptyState);
    refreshInteractiveSurfaces();
    return;
  }

  state.mechanicProfiles.forEach((profile) => {
    const card = elements.mechanicProfileTemplate.content.firstElementChild.cloneNode(true);
    const defaultPayoutMethod = getDefaultPayoutMethod(profile);
    const isActiveMechanic = profile.id === state.activeMechanicId;
    const specialties = profile.specialties || ["diagnostic"];

    card.querySelector(".registered-mechanic-status").textContent = isActiveMechanic
      ? "Active mechanic"
      : "Registered mechanic";
    card.querySelector(".registered-mechanic-name").textContent = profile.businessName;
    card.querySelector(".registered-mechanic-handle").textContent = formatMechanicHandle(profile.username);
    card.querySelector(".registered-mechanic-home").textContent =
      `${profile.baseCity} | ${profile.serviceRadiusMiles} mile radius`;
    card.querySelector(".registered-mechanic-contact").textContent =
      `${profile.email} | ${profile.phone}`;
    card.querySelector(".registered-mechanic-plan").textContent =
      `${getMechanicAvailabilityLabel(profile.dispatchMode)} | ${specialties
        .map((specialty) => titleCase(specialty))
        .join(", ")}${profile.serviceVehicle ? ` | ${profile.serviceVehicle}` : ""}`;
    card.querySelector(".registered-mechanic-payment").textContent = defaultPayoutMethod
      ? `Default receiving: ${formatPayoutMethodLabel(defaultPayoutMethod)}`
      : "No receiving method saved yet.";

    const selectButton = card.querySelector(".registered-mechanic-select-button");
    const editButton = card.querySelector(".registered-mechanic-edit-button");
    selectButton.textContent = isActiveMechanic ? "Active now" : "Set active";
    selectButton.disabled = isActiveMechanic;
    selectButton.addEventListener("click", () => {
      state.activeMechanicId = profile.id;
      persistActiveMechanicId();
      renderMechanicWorkspace();
      showToast(`Switched the active mechanic to ${profile.businessName}.`);
    });
    editButton.addEventListener("click", () => {
      populateMechanicProfileForm(profile);
      showToast(`Editing ${profile.businessName}.`);
    });

    elements.mechanicDirectory.appendChild(card);
  });

  refreshInteractiveSurfaces();
}

function renderActiveMechanicWorkspace() {
  const activeMechanic = getActiveMechanicProfile();
  const defaultPayoutMethod = getDefaultPayoutMethod(activeMechanic);

  if (elements.payoutMethodForm) {
    elements.payoutMethodForm
      .querySelectorAll("input, select, button")
      .forEach((field) => {
        field.disabled = !activeMechanic;
      });
  }

  if (elements.payoutMechanicTag) {
    elements.payoutMechanicTag.textContent = activeMechanic
      ? `Saving payment receiving methods for ${activeMechanic.businessName}`
      : "Select a mechanic to unlock receiving setup";
  }

  if (elements.payoutHint) {
    elements.payoutHint.textContent = activeMechanic
      ? "Default receiving setup can represent where mechanic earnings land after completed roadside jobs."
      : "Register or activate a mechanic profile first so MechGo knows who owns the receiving wallet.";
  }

  if (!hasMechanicWorkspace()) {
    return;
  }

  if (!activeMechanic) {
    if (elements.mechanicAccountBadge) {
      elements.mechanicAccountBadge.textContent = "No active mechanic";
    }
    if (elements.activeMechanicName) {
      elements.activeMechanicName.textContent = "No mechanic selected";
    }
    if (elements.activeMechanicHandle) {
      elements.activeMechanicHandle.textContent = "@register-a-mechanic";
    }
    if (elements.activeMechanicSummary) {
      elements.activeMechanicSummary.textContent =
        "Create a MechGo mechanic account to store service coverage, dispatch pricing, specialties, and receiving setup.";
    }
    if (elements.activeMechanicCity) {
      elements.activeMechanicCity.textContent = "Not set";
    }
    if (elements.activeMechanicRadius) {
      elements.activeMechanicRadius.textContent = "Not set";
    }
    if (elements.activeMechanicPricing) {
      elements.activeMechanicPricing.textContent = "Not set";
    }
    if (elements.activeMechanicPayoutDefault) {
      elements.activeMechanicPayoutDefault.textContent = "No receiving method";
    }
    if (elements.activeMechanicMode) {
      elements.activeMechanicMode.textContent = "Dispatch inactive";
    }
    if (elements.activeMechanicContact) {
      elements.activeMechanicContact.textContent = "No contact details yet";
    }
    return;
  }

  if (elements.mechanicAccountBadge) {
    elements.mechanicAccountBadge.textContent = "Marketplace live";
  }
  if (elements.activeMechanicName) {
    elements.activeMechanicName.textContent = activeMechanic.businessName;
  }
  if (elements.activeMechanicHandle) {
    elements.activeMechanicHandle.textContent = formatMechanicHandle(activeMechanic.username);
  }
  if (elements.activeMechanicSummary) {
    const specialties = activeMechanic.specialties || ["diagnostic"];
    const payoutMethodCount = (activeMechanic.payoutMethods || []).length;
    elements.activeMechanicSummary.textContent =
      `${activeMechanic.businessName} is dispatch-ready with ${activeMechanic.jobsCompleted} completed jobs, ${
        specialties.length
      } specialties, and ${payoutMethodCount} receiving method${payoutMethodCount === 1 ? "" : "s"} on file.${
        activeMechanic.credentialStatus ? ` ${activeMechanic.credentialStatus}.` : ""
      }`;
  }
  if (elements.activeMechanicCity) {
    elements.activeMechanicCity.textContent = activeMechanic.baseAddress
      ? `${activeMechanic.baseCity} | ${activeMechanic.baseAddress}`
      : activeMechanic.baseCity;
  }
  if (elements.activeMechanicRadius) {
    elements.activeMechanicRadius.textContent = `${activeMechanic.serviceRadiusMiles} miles`;
  }
  if (elements.activeMechanicPricing) {
    elements.activeMechanicPricing.textContent = `${formatCurrency(activeMechanic.baseCallout)} base callout`;
  }
  if (elements.activeMechanicPayoutDefault) {
    elements.activeMechanicPayoutDefault.textContent = defaultPayoutMethod
      ? formatPayoutMethodLabel(defaultPayoutMethod)
      : "No receiving method";
  }
  if (elements.activeMechanicMode) {
    elements.activeMechanicMode.textContent = getMechanicAvailabilityLabel(activeMechanic.dispatchMode);
  }
  if (elements.activeMechanicContact) {
    elements.activeMechanicContact.textContent = `${activeMechanic.leadName} | ${activeMechanic.email} | ${activeMechanic.phone}${
      activeMechanic.serviceVehicle ? ` | ${activeMechanic.serviceVehicle}` : ""
    }${activeMechanic.coverageNotes ? ` | ${activeMechanic.coverageNotes}` : ""}`;
  }
}

function renderPayoutMethods() {
  if (!elements.payoutMethodList || !elements.payoutMethodCount || !elements.payoutTemplate) {
    return;
  }

  const activeMechanic = getActiveMechanicProfile();
  const payoutMethods = activeMechanic ? activeMechanic.payoutMethods || [] : [];
  elements.payoutMethodList.innerHTML = "";
  elements.payoutMethodCount.textContent = `${payoutMethods.length} method${
    payoutMethods.length === 1 ? "" : "s"
  }`;

  if (!activeMechanic) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "No active mechanic yet. Select a registered mechanic profile before adding payment receiving methods.";
    elements.payoutMethodList.appendChild(emptyState);
    refreshInteractiveSurfaces();
    return;
  }

  if (!payoutMethods.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "No payment receiving methods saved yet. Add a receiving destination so the mechanic account feels production-ready.";
    elements.payoutMethodList.appendChild(emptyState);
    refreshInteractiveSurfaces();
    return;
  }

  payoutMethods.forEach((payoutMethod) => {
    const card = elements.payoutTemplate.content.firstElementChild.cloneNode(true);

    card.querySelector(".payout-card-type").textContent = getPayoutTypeLabel(payoutMethod.type);
    card.querySelector(".payout-card-label").textContent = payoutMethod.label;
    card.querySelector(".payout-card-meta").textContent =
      `Ending in ${payoutMethod.lastFour} | ${titleCase(payoutMethod.frequency)} payouts`;
    card.querySelector(".payout-card-zip").textContent = payoutMethod.isDefault
      ? "Primary settlement route"
      : "Secondary settlement route";
    card.querySelector(".payout-card-badge").textContent = payoutMethod.isDefault
      ? "Default receiving"
      : "Saved route";

    const setDefaultButton = card.querySelector(".payout-set-default-button");
    const removeButton = card.querySelector(".payout-remove-button");
    setDefaultButton.disabled = payoutMethod.isDefault;
    setDefaultButton.addEventListener("click", () => {
      setDefaultPayoutMethod(payoutMethod.id);
    });
    removeButton.addEventListener("click", () => {
      removePayoutMethod(payoutMethod.id);
    });

    elements.payoutMethodList.appendChild(card);
  });

  refreshInteractiveSurfaces();
}

function populateMechanicProfileForm(profile) {
  if (
    !elements.registeredMechanicId ||
    !elements.mechanicBusinessName ||
    !elements.mechanicUsername ||
    !elements.mechanicLeadName ||
    !elements.mechanicEmail ||
    !elements.mechanicPhone ||
    !elements.mechanicBaseCity ||
    !elements.mechanicBaseAddress ||
    !elements.mechanicServiceRadius ||
    !elements.mechanicBaseCallout ||
    !elements.mechanicEtaMinutes ||
    !elements.mechanicJobsCompleted ||
    !elements.mechanicDispatchMode ||
    !elements.mechanicServiceVehicle ||
    !elements.mechanicCredentialStatus ||
    !elements.mechanicCoverageNotes ||
    !elements.mechanicBio
  ) {
    return;
  }

  elements.registeredMechanicId.value = profile.id;
  elements.mechanicBusinessName.value = profile.businessName;
  elements.mechanicUsername.value = profile.username;
  elements.mechanicLeadName.value = profile.leadName;
  elements.mechanicEmail.value = profile.email;
  elements.mechanicPhone.value = profile.phone;
  elements.mechanicBaseCity.value = profile.baseCity;
  elements.mechanicBaseAddress.value = profile.baseAddress || "";
  elements.mechanicServiceRadius.value = String(profile.serviceRadiusMiles);
  elements.mechanicBaseCallout.value = String(profile.baseCallout);
  elements.mechanicEtaMinutes.value = String(profile.etaMinutes);
  elements.mechanicJobsCompleted.value = String(profile.jobsCompleted);
  elements.mechanicDispatchMode.value = profile.dispatchMode || "full";
  elements.mechanicServiceVehicle.value = profile.serviceVehicle || "";
  elements.mechanicCredentialStatus.value = profile.credentialStatus || "";
  elements.mechanicCoverageNotes.value = profile.coverageNotes || "";
  elements.mechanicBio.value = profile.bio || "";
  syncMechanicSpecialtyInputs(profile.specialties || []);
  setActiveProfileTab("mechanic-profile", "business");
  syncMechanicProfileForm();
}

function clearMechanicProfileForm() {
  if (!elements.mechanicProfileForm) {
    return;
  }

  elements.mechanicProfileForm.reset();
  if (elements.registeredMechanicId) {
    elements.registeredMechanicId.value = "";
  }
  if (elements.mechanicBaseCity) {
    elements.mechanicBaseCity.value = state.city;
  }
  if (elements.mechanicBaseAddress) {
    elements.mechanicBaseAddress.value = "";
  }
  if (elements.mechanicServiceVehicle) {
    elements.mechanicServiceVehicle.value = "";
  }
  if (elements.mechanicCredentialStatus) {
    elements.mechanicCredentialStatus.value = "";
  }
  if (elements.mechanicCoverageNotes) {
    elements.mechanicCoverageNotes.value = "";
  }
  syncMechanicSpecialtyInputs(["battery", "diagnostic"]);
  setActiveProfileTab("mechanic-profile", "business");
  syncMechanicProfileForm();
}

function syncMechanicProfileForm() {
  const isEditing = Boolean(elements.registeredMechanicId && elements.registeredMechanicId.value);

  if (elements.mechanicFormModeLabel) {
    elements.mechanicFormModeLabel.textContent = isEditing
      ? "Edit active mechanic"
      : "Register a MechGo mechanic";
  }

  if (elements.mechanicProfileSubmitButton) {
    elements.mechanicProfileSubmitButton.textContent = isEditing
      ? "Update mechanic profile"
      : "Save mechanic profile";
  }
}

function getSelectedMechanicSpecialties() {
  return elements.mechanicSpecialties
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function syncMechanicSpecialtyInputs(specialties) {
  const selectedSpecialties = new Set(specialties);
  elements.mechanicSpecialties.forEach((input) => {
    input.checked = selectedSpecialties.has(input.value);
  });
}

function synchronizeActiveMechanicSelection() {
  if (!state.mechanicProfiles.length) {
    state.activeMechanicId = "";
    persistActiveMechanicId();
    return;
  }

  const hasActiveMechanic = state.mechanicProfiles.some(
    (profile) => profile.id === state.activeMechanicId
  );

  if (!hasActiveMechanic) {
    state.activeMechanicId = state.mechanicProfiles[0].id;
    persistActiveMechanicId();
  }
}

function getActiveMechanicProfile() {
  if (!state.activeMechanicId) {
    return null;
  }

  return state.mechanicProfiles.find((profile) => profile.id === state.activeMechanicId) || null;
}

function getDefaultPayoutMethod(profile) {
  if (!profile || !profile.payoutMethods || !profile.payoutMethods.length) {
    return null;
  }

  return profile.payoutMethods.find((payoutMethod) => payoutMethod.isDefault) || profile.payoutMethods[0];
}

function updateMechanicPayoutMethods(mechanicId, nextPayoutMethods) {
  state.mechanicProfiles = state.mechanicProfiles.map((profile) =>
    profile.id === mechanicId
      ? {
          ...profile,
          payoutMethods: nextPayoutMethods,
          updatedAt: new Date().toISOString(),
        }
      : profile
  );

  persistMechanicProfiles();
}

function setDefaultPayoutMethod(payoutMethodId) {
  const activeMechanic = getActiveMechanicProfile();
  if (!activeMechanic) {
    return;
  }

  const nextPayoutMethods = (activeMechanic.payoutMethods || []).map((payoutMethod) => ({
    ...payoutMethod,
    isDefault: payoutMethod.id === payoutMethodId,
  }));

  updateMechanicPayoutMethods(activeMechanic.id, nextPayoutMethods);
  renderMechanicWorkspace();
  showToast(`Updated the default receiving route for ${activeMechanic.businessName}.`);
}

function removePayoutMethod(payoutMethodId) {
  const activeMechanic = getActiveMechanicProfile();
  if (!activeMechanic) {
    return;
  }

  const nextPayoutMethods = (activeMechanic.payoutMethods || []).filter(
    (payoutMethod) => payoutMethod.id !== payoutMethodId
  );

  if (nextPayoutMethods.length && !nextPayoutMethods.some((payoutMethod) => payoutMethod.isDefault)) {
    nextPayoutMethods[0] = {
      ...nextPayoutMethods[0],
      isDefault: true,
    };
  }

  updateMechanicPayoutMethods(activeMechanic.id, nextPayoutMethods);
  renderMechanicWorkspace();
  showToast(`Removed a receiving method from ${activeMechanic.businessName}.`);
}

function resetPayoutMethodForm() {
  if (!elements.payoutMethodForm) {
    return;
  }

  elements.payoutMethodForm.reset();
  if (elements.payoutMethodDefault) {
    const activeMechanic = getActiveMechanicProfile();
    elements.payoutMethodDefault.checked = !activeMechanic || !(activeMechanic.payoutMethods || []).length;
  }
}

function updateLocationPanel(overrideStatus) {
  if (!hasLocationPanel()) {
    return;
  }

  const isRequesting = Boolean(overrideStatus);
  const hasGps = Boolean(state.userLocation);
  const hasActiveLocation = Boolean(state.activeLocation);

  if (hasGps && hasActiveLocation) {
    elements.locationStatus.textContent = `GPS active near ${state.activeLocation.label}.`;
    elements.locationMeta.textContent = buildLocationMetaText();
    elements.pricingSignal.textContent = buildPricingSignalText();
    elements.locationModeBadge.textContent = "Live GPS mode";
    elements.locationModeBadge.classList.add("location-active");
    elements.locateUserButton.textContent = "Refresh GPS";
    elements.clearLocationButton.disabled = false;
    return;
  }

  if (isRequesting) {
    elements.locationStatus.textContent = overrideStatus;
    elements.locationMeta.textContent =
      "Allow location access in the browser to rank the nearest mechanics and pull local weather.";
    elements.pricingSignal.textContent =
      "Quotes will update once MechGo has your live coordinates.";
    elements.locationModeBadge.textContent = "Connecting GPS";
    elements.locationModeBadge.classList.remove("location-active");
    elements.locateUserButton.textContent = "Requesting GPS...";
    elements.clearLocationButton.disabled = true;
    return;
  }

  if (hasActiveLocation) {
    elements.locationStatus.textContent = `City pricing active for ${state.activeLocation.label}.`;
    elements.locationMeta.textContent = buildLocationMetaText();
    elements.pricingSignal.textContent = buildPricingSignalText();
    elements.locationModeBadge.textContent = "City weather mode";
    elements.locationModeBadge.classList.remove("location-active");
    elements.locateUserButton.textContent = "Use live GPS";
    elements.clearLocationButton.disabled = true;
    return;
  }

  elements.locationModeBadge.classList.remove("location-active");
  elements.locateUserButton.textContent = "Use live GPS";
  elements.clearLocationButton.disabled = true;

  if (state.locationError) {
    elements.locationStatus.textContent = state.locationError;
    elements.locationMeta.textContent = "You can still search by city while GPS is unavailable.";
    elements.pricingSignal.textContent =
      "Quotes will still react to time of day, and weather will load once a city is mapped.";
  } else if (state.weatherError) {
    elements.locationStatus.textContent = state.weatherError;
    elements.locationMeta.textContent = "Try another city or wait a moment before retrying.";
    elements.pricingSignal.textContent =
      "Distance and time-of-day pricing are still active even if weather is temporarily unavailable.";
  } else {
    elements.locationStatus.textContent =
      "GPS is off. Turn it on to rank mechanics by who is closest to you.";
    elements.locationMeta.textContent =
      "City search stays active until you allow browser location access.";
    elements.pricingSignal.textContent =
      "Quotes react to distance, time of day, and local roadside weather.";
  }

  elements.locationModeBadge.textContent = "Manual city mode";
}

function buildLocationMetaText() {
  if (state.weatherStatus === "loading") {
    return `Weather-aware pricing is syncing for ${state.activeLocation.label}.`;
  }

  if (state.weatherError) {
    return state.weatherError;
  }

  if (!state.weather) {
    return `Pricing location: ${state.activeLocation.label}`;
  }

  return `Weather: ${formatWeatherSummary(state.weather)}`;
}

function buildPricingSignalText() {
  const pricingContext = getPricingContext();
  const timeDescription = pricingContext.time.description;

  if (state.weatherStatus === "loading") {
    return `Pricing now: ${timeDescription}. Weather syncing, and travel distance still affects every quote.`;
  }

  if (!state.weather) {
    return `Pricing now: ${timeDescription}. Quotes still scale with mechanic travel distance.`;
  }

  return `Pricing now: ${timeDescription}. ${pricingContext.weather.signalText} Closest mechanics carry the lowest travel fee.`;
}

function getPricingContext() {
  const hour = getLocalHourForPricing();
  return {
    hour,
    time: getTimeAdjustment(hour),
    weather: getWeatherAdjustment(state.weather),
  };
}

function getLocalHourForPricing() {
  const timezone =
    (state.activeLocation && state.activeLocation.timezone) ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "UTC";
  const formattedHour = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: timezone,
  }).format(new Date());

  return Number(formattedHour) % 24;
}

function getTimeAdjustment(hour) {
  if (hour >= 22 || hour < 6) {
    return {
      amount: 28,
      description: "After-hours roadside dispatch is active.",
      shortLabel: "after-hours",
      etaOffset: 6,
    };
  }

  if ((hour >= 7 && hour < 9) || (hour >= 16 && hour < 19)) {
    return {
      amount: 16,
      description: "Rush-hour traffic is pushing dispatch costs up.",
      shortLabel: "rush-hour traffic",
      etaOffset: 5,
    };
  }

  if (hour >= 19 && hour < 22) {
    return {
      amount: 10,
      description: "Evening dispatch demand is active.",
      shortLabel: "evening dispatch",
      etaOffset: 2,
    };
  }

  return {
    amount: 0,
    description: "Standard daytime dispatch is active.",
    shortLabel: "daytime dispatch",
    etaOffset: 0,
  };
}

function getWeatherAdjustment(weather) {
  if (!weather) {
    return {
      amount: 0,
      summaryLabel: "weather pending",
      signalText: "Weather pricing is still syncing.",
    };
  }

  let amount = 0;
  const labels = [];

  if (weather.precipitation >= 0.25) {
    amount += 28;
    labels.push("heavy rain");
  } else if (weather.precipitation >= 0.08) {
    amount += 16;
    labels.push("rain");
  }

  if (weather.windSpeed >= 35) {
    amount += 22;
    labels.push("high winds");
  } else if (weather.windSpeed >= 20) {
    amount += 10;
    labels.push("wind");
  }

  if (weather.temperature <= 32 || weather.temperature >= 100) {
    amount += 18;
    labels.push("extreme temperature");
  } else if (weather.temperature <= 40 || weather.temperature >= 95) {
    amount += 8;
    labels.push("heat or cold");
  }

  if (!labels.length) {
    return {
      amount: 0,
      summaryLabel: "dry roads",
      signalText: "Road conditions look stable right now.",
    };
  }

  return {
    amount,
    summaryLabel: labels.join(" + "),
    signalText: `Weather adds pricing pressure from ${labels.join(" + ")}.`,
  };
}

function buildQuote(mechanic, serviceKey, distanceMiles, pricingContext) {
  const serviceProfile = serviceProfiles[serviceKey] || serviceProfiles.diagnostic;
  const baseCallout = mechanic.baseCallout;
  const laborCharge = serviceProfile.laborBase;
  const travelCharge = getTravelCharge(distanceMiles);
  const timeCharge = pricingContext.time.amount;
  const weatherCharge = pricingContext.weather.amount;

  const subtotal = baseCallout + laborCharge + travelCharge + timeCharge + weatherCharge;
  const lowEstimate = roundToNearestFive(subtotal * 0.96);
  const highEstimate = Math.max(lowEstimate + 10, roundToNearestFive(subtotal * 1.12));

  const factorBits = [
    `travel ${formatCurrency(travelCharge)}`,
    pricingContext.time.amount > 0
      ? `${pricingContext.time.shortLabel} ${formatCurrency(pricingContext.time.amount)}`
      : "daylight traffic normal",
    pricingContext.weather.amount > 0
      ? `${pricingContext.weather.summaryLabel} ${formatCurrency(pricingContext.weather.amount)}`
      : "weather stable",
  ];

  return {
    baseCallout,
    laborCharge,
    travelCharge,
    timeCharge,
    weatherCharge,
    subtotal,
    lowEstimate,
    highEstimate,
    displayRange: `${formatCurrency(lowEstimate)}-${formatCurrency(highEstimate)}`,
    breakdownNote: `Price factors: ${factorBits.join(" | ")}`,
  };
}

function getTravelCharge(distanceMiles) {
  if (!Number.isFinite(distanceMiles)) {
    return 22;
  }

  const includedMiles = 2;
  const billableMiles = Math.max(0, distanceMiles - includedMiles);
  const remoteZoneCharge = distanceMiles > 12 ? 18 : 0;

  return roundToNearestDollar(18 + billableMiles * 6.5 + remoteZoneCharge);
}

function getRequestedServiceForMechanic(mechanic) {
  return state.issue === "all" ? mechanic.specialties[0] : state.issue;
}

function getLiveEtaMinutes(baseEtaMinutes, distanceMiles, etaOffset) {
  if (!Number.isFinite(distanceMiles)) {
    return baseEtaMinutes + etaOffset;
  }

  const distanceFactor = Math.round(distanceMiles * 3.2);
  const adjustedEta = Math.round(baseEtaMinutes * 0.55) + distanceFactor + etaOffset;
  return Math.max(8, adjustedEta);
}

function pickUrgencyForMechanic(mechanic) {
  if (state.urgency !== "all" && mechanic.urgency.includes(state.urgency)) {
    return state.urgency;
  }

  return mechanic.urgency[0];
}

function getDistanceMiles(origin, destination) {
  const earthRadiusMiles = 3958.8;
  const latDelta = toRadians(destination.lat - origin.lat);
  const lngDelta = toRadians(destination.lng - origin.lng);
  const originLat = toRadians(origin.lat);
  const destinationLat = toRadians(destination.lat);

  const haversine =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(lngDelta / 2) *
      Math.sin(lngDelta / 2);
  const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadiusMiles * arc;
}

function getNearestCityLabel(location) {
  const closestMechanic = getMarketplaceMechanics()
    .map((mechanic) => ({
      city: mechanic.city,
      distanceMiles: getDistanceMiles(location, mechanic.coordinates),
    }))
    .sort((left, right) => left.distanceMiles - right.distanceMiles)[0];

  return closestMechanic ? closestMechanic.city : "your area";
}

function formatDistanceMiles(distanceMiles) {
  if (distanceMiles < 1) {
    return "< 1 mile away";
  }

  return `${distanceMiles.toFixed(1)} miles away`;
}

function formatCoordinates(location) {
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
}

function formatWeatherSummary(weather) {
  return `${Math.round(weather.temperature)}F | ${weather.precipitation.toFixed(2)} in precipitation | ${Math.round(weather.windSpeed)} mph wind`;
}

function formatGeocodedLabel(result) {
  const parts = [result.name];
  if (result.admin1) {
    parts.push(result.admin1);
  } else if (result.country_code) {
    parts.push(result.country_code);
  }

  return parts.join(", ");
}

function normalizeLocationQuery(query) {
  return query.trim().toLowerCase();
}

function getWeatherCacheKey(location) {
  return `${location.lat.toFixed(2)},${location.lng.toFixed(2)}`;
}

function roundToNearestFive(value) {
  return Math.max(45, Math.round(value / 5) * 5);
}

function roundToNearestDollar(value) {
  return Math.round(value);
}

function formatCurrency(amount) {
  return `$${Math.round(amount)}`;
}

function toRadians(value) {
  return value * (Math.PI / 180);
}

function showToast(message) {
  if (!elements.toast) {
    return;
  }

  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2400);
}

function persistBookings() {
  localStorage.setItem(bookingStorageKey, JSON.stringify(state.bookings));
}

function loadBookings() {
  try {
    const savedValue = localStorage.getItem(bookingStorageKey);
    return savedValue ? JSON.parse(savedValue) : [];
  } catch (error) {
    return [];
  }
}

function persistDriverVerifications() {
  localStorage.setItem(verificationStorageKey, JSON.stringify(state.driverVerifications));
}

function persistSearchState() {
  const nextSearchState = {
    city: state.city,
    issue: state.issue,
    urgency: state.urgency,
  };

  localStorage.setItem(searchStorageKey, JSON.stringify(nextSearchState));
}

function loadDriverVerifications() {
  try {
    const savedValue = localStorage.getItem(verificationStorageKey);
    return savedValue ? JSON.parse(savedValue) : [];
  } catch (error) {
    return [];
  }
}

function persistCustomerProfiles() {
  localStorage.setItem(customerProfilesStorageKey, JSON.stringify(state.customerProfiles));
}

function loadCustomerProfiles() {
  try {
    const savedValue = localStorage.getItem(customerProfilesStorageKey);
    const parsedValue = savedValue ? JSON.parse(savedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function persistActiveCustomerId() {
  localStorage.setItem(activeCustomerStorageKey, state.activeCustomerId || "");
}

function loadActiveCustomerId() {
  try {
    return localStorage.getItem(activeCustomerStorageKey) || "";
  } catch (error) {
    return "";
  }
}

function persistMechanicProfiles() {
  localStorage.setItem(mechanicProfilesStorageKey, JSON.stringify(state.mechanicProfiles));
}

function loadMechanicProfiles() {
  try {
    const savedValue = localStorage.getItem(mechanicProfilesStorageKey);
    const parsedValue = savedValue ? JSON.parse(savedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function persistActiveMechanicId() {
  localStorage.setItem(activeMechanicStorageKey, state.activeMechanicId || "");
}

function loadActiveMechanicId() {
  try {
    return localStorage.getItem(activeMechanicStorageKey) || "";
  } catch (error) {
    return "";
  }
}

function persistAuthAccounts() {
  localStorage.setItem(authAccountsStorageKey, JSON.stringify(state.authAccounts));
}

function loadAuthAccounts() {
  try {
    const savedValue = localStorage.getItem(authAccountsStorageKey);
    const parsedValue = savedValue ? JSON.parse(savedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function persistAuthSession() {
  if (!state.authSession) {
    localStorage.removeItem(authSessionStorageKey);
    return;
  }

  localStorage.setItem(authSessionStorageKey, JSON.stringify(state.authSession));
}

function loadAuthSession() {
  try {
    const savedValue = localStorage.getItem(authSessionStorageKey);
    if (!savedValue) {
      return null;
    }

    const parsedValue = JSON.parse(savedValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : null;
  } catch (error) {
    return null;
  }
}

function persistSupportReports() {
  localStorage.setItem(supportReportsStorageKey, JSON.stringify(state.supportReports));
}

function loadSupportReports() {
  try {
    const savedValue = localStorage.getItem(supportReportsStorageKey);
    const parsedValue = savedValue ? JSON.parse(savedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function persistPostAuthRedirect() {
  if (!state.postAuthRedirect) {
    localStorage.removeItem(postAuthRedirectStorageKey);
    return;
  }

  localStorage.setItem(postAuthRedirectStorageKey, JSON.stringify(state.postAuthRedirect));
}

function loadPostAuthRedirect() {
  try {
    const savedValue = localStorage.getItem(postAuthRedirectStorageKey);
    if (!savedValue) {
      return null;
    }

    const parsedValue = JSON.parse(savedValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : null;
  } catch (error) {
    return null;
  }
}

function clearPostAuthRedirect() {
  state.postAuthRedirect = null;
  persistPostAuthRedirect();
}

function reconcilePostAuthRedirect() {
  const pendingRedirect = state.postAuthRedirect || loadPostAuthRedirect();
  const currentPageName = getCurrentPageName();

  if (!pendingRedirect) {
    return;
  }

  if (
    (pendingRedirect.reason === "restricted" || pendingRedirect.reason === "mechanic-only") &&
    pendingRedirect.path === currentPageName
  ) {
    clearPostAuthRedirect();
  }
}

function loadSearchState() {
  try {
    const savedValue = localStorage.getItem(searchStorageKey);
    return savedValue ? JSON.parse(savedValue) : {};
  } catch (error) {
    return {};
  }
}

function formatSubmissionTime(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function titleCase(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeUsername(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function normalizeIdentifier(value) {
  return value.trim().toLowerCase();
}

function formatCustomerHandle(username) {
  return `@${username}`;
}

function formatMechanicHandle(username) {
  return `@${username}`;
}

function formatSignedInLabel(account) {
  if (!account) {
    return "Sign in";
  }

  return account.role === "customer"
    ? formatCustomerHandle(account.username)
    : formatMechanicHandle(account.username);
}

function getMembershipPlanLabel(planKey) {
  return membershipPlans[planKey] || "Roadside Starter";
}

function getPaymentTypeLabel(paymentType) {
  return paymentMethodTypes[paymentType] || titleCase(paymentType || "card");
}

function formatPaymentMethodLabel(paymentMethod) {
  return `${getPaymentTypeLabel(paymentMethod.type)} ending in ${paymentMethod.lastFour}`;
}

function getPayoutTypeLabel(payoutType) {
  return payoutMethodTypes[payoutType] || titleCase(payoutType || "bank");
}

function formatPayoutMethodLabel(payoutMethod) {
  return `${getPayoutTypeLabel(payoutMethod.type)} ending in ${payoutMethod.lastFour}`;
}

function getDispatchUrgencyOptions(dispatchMode) {
  const dispatchModes = {
    full: ["emergency", "today", "scheduled"],
    emergency: ["emergency", "today"],
    sameDay: ["today", "scheduled"],
    scheduled: ["scheduled"],
  };

  return dispatchModes[dispatchMode] || dispatchModes.full;
}

function getMechanicAvailabilityLabel(dispatchMode) {
  const dispatchLabels = {
    full: "24/7 emergency dispatch",
    emergency: "Emergency crew on duty",
    sameDay: "Same-day roadside coverage",
    scheduled: "Scheduled specialist",
  };

  return dispatchLabels[dispatchMode] || dispatchLabels.full;
}

function resolveMechanicCoordinates(city) {
  const normalizedCity = normalizeLocationQuery(city || "");
  const marketplaceMechanics = mechanics.filter(
    (mechanic) => normalizeLocationQuery(mechanic.city) === normalizedCity
  );
  const nearbyMechanics = marketplaceMechanics.length
    ? marketplaceMechanics
    : mechanics.filter((mechanic) =>
        normalizeLocationQuery(mechanic.city).includes(normalizedCity) ||
        normalizedCity.includes(normalizeLocationQuery(mechanic.city))
      );

  if (nearbyMechanics.length) {
    const coordinateTotals = nearbyMechanics.reduce(
      (totals, mechanic) => ({
        lat: totals.lat + mechanic.coordinates.lat,
        lng: totals.lng + mechanic.coordinates.lng,
      }),
      { lat: 0, lng: 0 }
    );

    return {
      lat: coordinateTotals.lat / nearbyMechanics.length,
      lng: coordinateTotals.lng / nearbyMechanics.length,
    };
  }

  return { lat: 30.2672, lng: -97.7431 };
}

function hasLocationPanel() {
  return Boolean(
    elements.locationStatus &&
      elements.locationMeta &&
      elements.pricingSignal &&
      elements.locationModeBadge &&
      elements.locateUserButton &&
      elements.clearLocationButton
  );
}

function hasCommandCenter() {
  return Boolean(
    elements.commandCenterMode &&
      elements.commandCenterWeather &&
      elements.commandCenterCoverage &&
      elements.commandCenterTempo
  );
}

function hasCustomerWorkspace() {
  return Boolean(
    elements.customerDirectory ||
      elements.paymentMethodList ||
      elements.activeCustomerName ||
      elements.customerProfileForm
  );
}

function hasMechanicWorkspace() {
  return Boolean(
    elements.mechanicDirectory ||
      elements.payoutMethodList ||
      elements.activeMechanicName ||
      elements.mechanicProfileForm
  );
}

function hasAuthWorkspace() {
  return Boolean(
    elements.customerSignInForm ||
      elements.mechanicSignInForm ||
      elements.customerCreateForm ||
      elements.mechanicCreateForm ||
      elements.signOutButton
  );
}

function hasSupportWorkspace() {
  return Boolean(elements.problemReportForm || elements.reportList || elements.reportCount);
}

function hasSettingsWorkspace() {
  return Boolean(
    elements.settingsForm ||
      elements.settingsDisplayName ||
      elements.settingsPrimaryEmail ||
      elements.verifyEmailButton
  );
}

function hasDashboard() {
  return Boolean(
    elements.dashboardGreeting ||
      elements.dashboardCustomerLink ||
      elements.dashboardMechanicLink
  );
}

function shouldLoadEnvironment() {
  return Boolean(elements.mechanicGrid || hasCommandCenter() || hasLocationPanel());
}

function getCurrentPageName() {
  const pathname = window.location.pathname || "";
  const currentPageName = pathname.split("/").pop();
  return (currentPageName || "index.html").toLowerCase();
}

function getLinkedPageName(href) {
  if (!href) {
    return "index.html";
  }

  try {
    const linkedUrl = new URL(href, window.location.href);
    const linkedPageName = linkedUrl.pathname.split("/").pop();
    return (linkedPageName || "index.html").toLowerCase();
  } catch (error) {
    return href.split("#")[0].toLowerCase() || "index.html";
  }
}
