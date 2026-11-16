
import {
    get,
    post,
    patch,
    remove,
    requireUser,
    money,
    statusBadge,
    escapeHTML
} from "./api.js";

// ==============================
// Authentication & User
// ==============================

const user = requireUser();

if (!user) {
    throw new Error("Authentication required");
}

const role = user.role;

const roleNames = {
    customer: "Customer",
    officer: "Zone Officer",
    operator: "Hydrant Operator",
    driver: "Driver",
    admin: "Administrator"
};

document.querySelector("#welcome").textContent = `Welcome, ${user.name}`;
document.querySelector("#roleLabel").textContent = roleNames[role] || role;

document.querySelector("#logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("paanilinkUser");
    location.href = "../login.html";
});

// ==============================
// Navigation Items
// ==============================

const navItems = {
    customer: [
        ["dashboard", "Dashboard", "fa-gauge"],
        ["book", "Book tanker", "fa-truck"],
        ["bookings", "My bookings", "fa-calendar-check"],
        ["subsidy", "Subsidy application", "fa-hand-holding-heart"],
        ["bills", "Bills", "fa-file-invoice"]
    ],

    officer: [
        ["dashboard", "Dashboard", "fa-gauge"],
        ["applications", "Subsidy applications", "fa-file-circle-check"],
        ["approvals", "Booking approvals", "fa-clipboard-check"],
        ["disputes", "Disputes", "fa-triangle-exclamation"]
    ],

    operator: [
        ["dashboard", "Dashboard", "fa-gauge"],
        ["bookings", "Approved bookings", "fa-list-check"],
        ["dispatch", "Dispatch management", "fa-truck-fast"]
    ],

    driver: [
        ["dashboard", "My trips", "fa-gauge"],
        ["trips", "Assigned trips", "fa-route"]
    ],

    admin: [
        ["dashboard", "Dashboard", "fa-gauge"],
        ["users", "Users", "fa-users"],
        ["zones", "Zones", "fa-map"],
        ["hydrants", "Hydrants", "fa-faucet"],
        ["tankers", "Tankers", "fa-truck"],
        ["rates", "Rates & quotas", "fa-coins"],
        ["reports", "Reports", "fa-chart-column"]
    ]
};

const allowed = navItems[role] || navItems.customer;

const params = new URLSearchParams(location.search);

let page = params.get("page") || "dashboard";

if (!allowed.some(x => x[0] === page)) {
    page = "dashboard";
}

document.querySelector("#sideNav").innerHTML = allowed
    .map(([key, label, icon]) => `
        <a
            class="side-link ${key === page ? "active" : ""}"
            href="dashboard.html?role=${role}&page=${key}"
        >
            <i class="fa-solid ${icon}"></i>
            ${label}
        </a>
    `)
    .join("");

// ==============================
// DOM Elements
// ==============================

const root = document.querySelector("#pageContent");
const message = document.querySelector("#appMessage");

// ==============================
// Helper Functions
// ==============================

function notice(text, type = "success") {
    message.innerHTML = `
        <div class="alert alert-${type} py-2">
            ${escapeHTML(text)}
        </div>
    `;

    setTimeout(() => {
        message.innerHTML = "";
    }, 3500);
}

function heading(title, desc, button = "") {
    return `
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
                <h2 class="page-title">${title}</h2>
                <p class="text-secondary mb-0">${desc}</p>
            </div>

            ${button}
        </div>
    `;
}

function stat(label, value, icon) {
    return `
        <div class="col-6 col-xl-3">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fa-solid ${icon}"></i>
                </div>

                <div class="stat-number">${value}</div>
                <div class="stat-label">${label}</div>
            </div>
        </div>
    `;
}

function table(headers, rows) {
    return `
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${h}</th>`).join("")}
                    </tr>
                </thead>

                <tbody>
                    ${
                        rows ||
                        `
                            <tr>
                                <td colspan="${headers.length}" class="empty-state">
                                    No records found.
                                </td>
                            </tr>
                        `
                    }
                </tbody>
            </table>
        </div>
    `;
}

// ==============================
// Main Load Function
// ==============================

async function load() {

    try {

        const [
            bookings,
            zones,
            hydrants,
            tankers,
            drivers,
            apps,
            trips,
            bills,
            disputes,
            users,
            rates
        ] = await Promise.all(
            [
                "bookings",
                "zones",
                "hydrants",
                "tankers",
                "drivers",
                "subsidyApplications",
                "trips",
                "bills",
                "disputes",
                "users",
                "rates"
            ].map(get)
        );

        // ==============================
        // Filter Records
        // ==============================

        const mine = bookings.filter(
            b => role !== "customer" || b.customerId === user.id
        );

        const zoneBookings = bookings.filter(
            b => role !== "officer" || b.zoneId === user.zoneId
        );

        const operatorBookings = bookings.filter(
            b => role !== "operator" || b.hydrantId === user.hydrantId
        );

        const myTrips = trips.filter(
            t => role !== "driver" || t.driverId === user.id
        );

        // ==============================
        // Helper Lookups
        // ==============================

        const zoneName = id =>
            zones.find(z => z.id === id)?.name || "—";

        const hydrantName = id =>
            hydrants.find(h => h.id === id)?.name || "—";

        const tankerName = id =>
            tankers.find(t => t.id === id)?.registration || "Not assigned";

        const driverName = id =>
            drivers.find(d => d.id === id)?.name || "Not assigned";

        // ==============================
        // Dashboard
        // ==============================

        if (page === "dashboard") {

            const count =
                role === "customer" ? mine.length :
                role === "driver" ? myTrips.length :
                role === "officer" ? zoneBookings.length :
                role === "operator" ? operatorBookings.length :
                bookings.length;

            root.innerHTML =
                heading(
                    `${roleNames[role]} Dashboard`,
                    "Overview of your PaaniLink activity"
                ) +

                `
                    <div class="row g-3 mb-4">

                        ${stat("Bookings", count, "fa-calendar-check")}

                        ${stat(
                            "Pending approvals",
                            apps.filter(a => a.status === "Pending").length,
                            "fa-hourglass-half"
                        )}

                        ${stat(
                            "Available tankers",
                            tankers.filter(t => t.status === "Available").length,
                            "fa-truck"
                        )}

                        ${stat("Hydrants", hydrants.length, "fa-faucet")}

                    </div>

                    <div class="panel">

                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">Recent bookings</h5>

                            <a href="dashboard.html?role=${role}&page=${
                                role === "customer" ? "bookings" :
                                role === "operator" ? "bookings" :
                                "approvals"
                            }">
                                View records
                            </a>
                        </div>

                        ${table(
                            ["Booking", "Customer", "Type", "Date", "Status"],

                            mine.slice(-6).reverse().map(b => `
                                <tr>
                                    <td>#${b.id}</td>
                                    <td>${escapeHTML(b.customerName)}</td>
                                    <td>${escapeHTML(b.type)}</td>
                                    <td>${b.date}</td>
                                    <td>${statusBadge(b.status)}</td>
                                </tr>
                            `).join("")
                        )}

                    </div>
                `;

        }

        // ==============================
        // Customer: Book Water Tanker
        // ==============================

        else if (page === "book") {

            const customerZone = zones.find(
                z => z.id === user.zoneId
            );

            root.innerHTML =
                heading(
                    "Book a water tanker",
                    "Choose a tanker size and delivery details"
                ) +

                `
                    <div class="panel">

                        <form id="bookingForm" class="row g-3" novalidate>

                            <div class="col-md-6">
                                <label class="form-label" for="zone">
                                    Zone
                                </label>

                                <select class="form-select" id="zone" required>
                                    ${zones.map(z => `
                                        <option
                                            value="${z.id}"
                                            ${z.id === user.zoneId ? "selected" : ""}
                                        >
                                            ${escapeHTML(z.name)}
                                        </option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="hydrant">
                                    Hydrant
                                </label>

                                <select class="form-select" id="hydrant" required>
                                    ${hydrants
                                        .filter(h =>
                                            !customerZone ||
                                            h.zoneId === Number(user.zoneId)
                                        )
                                        .map(h => `
                                            <option value="${h.id}">
                                                ${escapeHTML(h.name)}
                                            </option>
                                        `).join("")
                                    }
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="capacity">
                                    Tanker capacity
                                </label>

                                <select class="form-select" id="capacity" required>
                                    <option value="">Select capacity</option>

                                    ${[1000, 3000, 6000].map(c => `
                                        <option value="${c}">
                                            ${c.toLocaleString()} gallons
                                        </option>
                                    `).join("")}
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="type">
                                    Booking type
                                </label>

                                <select class="form-select" id="type" required>
                                    <option value="commercial">Commercial</option>
                                    <option value="subsidised">Subsidised</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="date">
                                    Delivery date
                                </label>

                                <input
                                    class="form-control"
                                    id="date"
                                    type="date"
                                    min="${new Date().toISOString().slice(0, 10)}"
                                    required
                                >
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="address">
                                    Delivery address
                                </label>

                                <input
                                    class="form-control"
                                    id="address"
                                    minlength="8"
                                    required
                                    value="${escapeHTML(user.address || "")}"
                                >
                            </div>

                            <div class="col-12">
                                <div id="pricePreview" class="alert-inline">
                                    Select capacity to see the rate.
                                </div>

                                <div class="form-hint">
                                    Subsidised bookings remain pending until approved by your Zone Officer.
                                </div>
                            </div>

                            <div class="col-12">
                                <button class="btn btn-primary">
                                    Submit booking
                                </button>
                            </div>

                        </form>

                    </div>
                `;

            const form = document.querySelector("#bookingForm");
            const capacity = document.querySelector("#capacity");
            const type = document.querySelector("#type");

            function price() {

                const r = rates.find(
                    x => x.capacity === Number(capacity.value)
                );

                document.querySelector("#pricePreview").textContent =
                    r
                        ? `Estimated amount: ${money(
                            type.value === "subsidised"
                                ? r.subsidised
                                : r.commercial
                        )}`
                        : "Select capacity to see the rate.";
            }

            capacity.addEventListener("change", price);
            type.addEventListener("change", price);

            form.addEventListener("submit", async e => {

                e.preventDefault();

                if (!form.reportValidity()) return;

                const c = Number(capacity.value);
                const r = rates.find(x => x.capacity === c);
                const kind = type.value;

                if (
                    kind === "subsidised" &&
                    !apps.some(
                        a => a.customerId === user.id &&
                        a.status === "Approved"
                    )
                ) {
                    notice(
                        "Your subsidy status must be approved before using subsidised rates.",
                        "warning"
                    );

                    return;
                }

                const hydrant = hydrants.find(
                    h => h.id === Number(
                        document.querySelector("#hydrant").value
                    )
                );

                if (
                    !hydrant ||
                    hydrant.status !== "Available" ||
                    hydrant.usedToday + c > hydrant.dailyQuota
                ) {
                    notice(
                        "Selected hydrant is unavailable or its daily quota would be exceeded.",
                        "danger"
                    );

                    return;
                }

                const amount =
                    kind === "subsidised"
                        ? r.subsidised
                        : r.commercial;

                await post("bookings", {
                    customerId: user.id,
                    customerName: user.name,
                    zoneId: Number(document.querySelector("#zone").value),
                    hydrantId: hydrant.id,
                    capacity: c,
                    type: kind,
                    status: kind === "subsidised"
                        ? "Pending Approval"
                        : "Approved",
                    date: document.querySelector("#date").value,
                    address: document.querySelector("#address").value.trim(),
                    amount,
                    tankerId: null,
                    driverId: null,
                    createdAt: new Date().toISOString().slice(0, 10)
                });

                notice("Booking created successfully.");

                setTimeout(() => {
                    location.href = "dashboard.html?role=customer&page=bookings";
                }, 700);

            });

        }

        // ==============================
        // Bookings & Approvals
        // ==============================

        else if (
            page === "bookings" ||
            page === "approvals"
        ) {

            const records =
                role === "customer" ? mine :
                role === "officer" ? zoneBookings :
                operatorBookings;

            const rows = records.slice().reverse().map(b => {

                let actions = "";

                if (
                    role === "customer" &&
                    ["Pending Approval", "Approved"].includes(b.status)
                ) {
                    actions = `
                        <button
                            class="btn btn-sm btn-outline-danger"
                            data-action="cancel"
                            data-id="${b.id}"
                        >
                            Cancel
                        </button>
                    `;
                }

                if (
                    role === "officer" &&
                    b.status === "Pending Approval"
                ) {
                    actions = `
                        <button
                            class="btn btn-sm btn-success me-1"
                            data-action="approve"
                            data-id="${b.id}"
                        >
                            Approve
                        </button>

                        <button
                            class="btn btn-sm btn-outline-danger"
                            data-action="reject"
                            data-id="${b.id}"
                        >
                            Reject
                        </button>
                    `;
                }

                if (
                    role === "operator" &&
                    b.status === "Approved"
                ) {
                    actions = `
                        <button
                            class="btn btn-sm btn-primary"
                            data-action="assign"
                            data-id="${b.id}"
                        >
                            Assign & dispatch
                        </button>
                    `;
                }

                return `
                    <tr>
                        <td>#${b.id}</td>
                        <td>${escapeHTML(b.customerName)}</td>
                        <td>${b.capacity.toLocaleString()} gal</td>
                        <td>${escapeHTML(b.type)}</td>
                        <td>${b.date}</td>
                        <td>${statusBadge(b.status)}</td>
                        <td>${actions || "—"}</td>
                    </tr>
                `;

            }).join("");

            root.innerHTML =
                heading(
                    role === "customer" ? "My bookings" :
                    role === "officer" ? "Booking approvals" :
                    "Approved bookings",

                    "Review booking records and permitted actions",

                    role === "customer"
                        ? '<a class="btn btn-primary" href="dashboard.html?role=customer&page=book">+ New booking</a>'
                        : ""
                ) +

                `
                    <div class="panel">
                        ${table(
                            ["ID", "Customer", "Capacity", "Type", "Date", "Status", "Actions"],
                            rows
                        )}
                    </div>
                `;

            root.querySelectorAll("[data-action]").forEach(btn => {

                btn.addEventListener("click", async () => {

                    const b = records.find(
                        x => x.id === Number(btn.dataset.id)
                    );

                    if (!b) return;

                    if (btn.dataset.action === "cancel") {
                        await patch("bookings", b.id, {
                            status: "Cancelled"
                        });
                    }

                    if (btn.dataset.action === "approve") {
                        await patch("bookings", b.id, {
                            status: "Approved"
                        });
                    }

                    if (btn.dataset.action === "reject") {
                        await patch("bookings", b.id, {
                            status: "Rejected"
                        });
                    }

                    if (btn.dataset.action === "assign") {

                        const availableT = tankers.find(
                            t =>
                                t.hydrantId === b.hydrantId &&
                                t.capacity === b.capacity &&
                                t.status === "Available"
                        );

                        const availableD = drivers.find(
                            d => d.status === "Available"
                        );

                        if (!availableT || !availableD) {
                            notice(
                                "No matching available tanker or driver.",
                                "danger"
                            );

                            return;
                        }

                        await patch("tankers", availableT.id, {
                            status: "Assigned"
                        });

                        await patch("drivers", availableD.id, {
                            status: "Assigned"
                        });

                        await patch("bookings", b.id, {
                            status: "Dispatched",
                            tankerId: availableT.id,
                            driverId: availableD.id
                        });

                        await post("trips", {
                            bookingId: b.id,
                            customerId: b.customerId,
                            driverId: availableD.id,
                            tankerId: availableT.id,
                            status: "Dispatched",
                            address: b.address,
                            date: b.date,
                            hydrantId: b.hydrantId
                        });

                    }

                    notice("Record updated.");
                    load();

                });

            });

        }

        // ==============================
        // Subsidy Application
        // ==============================

        else if (page === "subsidy") {

            root.innerHTML =
                heading(
                    "Subsidy application",
                    "Apply for reduced rates if your household or institution is eligible"
                ) +

                `
                    <div class="panel">

                        <form id="subsidyForm" class="row g-3">

                            <div class="col-md-6">
                                <label class="form-label" for="category">
                                    Applicant category
                                </label>

                                <select class="form-select" id="category" required>
                                    <option value="">Select</option>
                                    <option>Low-income household</option>
                                    <option>Hospital</option>
                                    <option>Mosque</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="proof">
                                    Proof details
                                </label>

                                <input
                                    class="form-control"
                                    id="proof"
                                    minlength="8"
                                    required
                                    placeholder="Describe certificate/document"
                                >
                            </div>

                            <div class="col-12">
                                <button class="btn btn-primary">
                                    Submit application
                                </button>
                            </div>

                        </form>

                    </div>
                `;

            document.querySelector("#subsidyForm").addEventListener(
                "submit",
                async e => {

                    e.preventDefault();

                    if (!e.currentTarget.reportValidity()) return;

                    await post("subsidyApplications", {
                        customerId: user.id,
                        customerName: user.name,
                        zoneId: user.zoneId,
                        category: document.querySelector("#category").value,
                        proof: document.querySelector("#proof").value.trim(),
                        status: "Pending"
                    });

                    notice("Subsidy application submitted.");
                    e.currentTarget.reset();

                }
            );

        }

        // ==============================
        // Officer: Subsidy Applications
        // ==============================

        else if (page === "applications") {

            const rows = apps
                .filter(a => a.zoneId === user.zoneId)
                .map(a => `
                    <tr>
                        <td>${escapeHTML(a.customerName)}</td>
                        <td>${escapeHTML(a.category)}</td>
                        <td>${escapeHTML(a.proof)}</td>
                        <td>${statusBadge(a.status)}</td>

                        <td>
                            ${
                                a.status === "Pending"
                                    ? `
                                        <button
                                            class="btn btn-sm btn-success"
                                            data-app="${a.id}"
                                            data-status="Approved"
                                        >
                                            Approve
                                        </button>

                                        <button
                                            class="btn btn-sm btn-outline-danger"
                                            data-app="${a.id}"
                                            data-status="Rejected"
                                        >
                                            Reject
                                        </button>
                                    `
                                    : "—"
                            }
                        </td>
                    </tr>
                `)
                .join("");

            root.innerHTML =
                heading(
                    "Subsidy applications",
                    "Verify eligibility for your assigned zone"
                ) +

                `
                    <div class="panel">
                        ${table(
                            ["Applicant", "Category", "Proof details", "Status", "Actions"],
                            rows
                        )}
                    </div>
                `;

            root.querySelectorAll("[data-app]").forEach(b => {

                b.addEventListener("click", async () => {

                    await patch(
                        "subsidyApplications",
                        b.dataset.app,
                        {
                            status: b.dataset.status
                        }
                    );

                    notice(
                        "Application " +
                        b.dataset.status.toLowerCase() +
                        "."
                    );

                    load();

                });

            });

        }

        // ==============================
        // Driver Trips & Dispatch
        // ==============================

        else if (page === "dispatch" || page === "trips") {

            const rows = (role === "driver" ? myTrips : trips)
                .map(t => `
                    <tr>
                        <td>#${t.bookingId}</td>
                        <td>${escapeHTML(t.address)}</td>
                        <td>${t.date}</td>
                        <td>${statusBadge(t.status)}</td>

                        <td>
                            ${
                                role === "driver" &&
                                ["Dispatched", "Arrived"].includes(t.status)
                                    ? `
                                        <button
                                            class="btn btn-sm btn-primary me-1"
                                            data-trip="${t.id}"
                                            data-status="${t.status === "Dispatched" ? "Arrived" : "Delivered"}"
                                        >
                                            ${t.status === "Dispatched" ? "Mark arrived" : "Mark delivered"}
                                        </button>

                                        <button
                                            class="btn btn-sm btn-outline-danger"
                                            data-trip="${t.id}"
                                            data-status="Failed"
                                        >
                                            Failed
                                        </button>
                                    `
                                    : "—"
                            }
                        </td>
                    </tr>
                `)
                .join("");

            root.innerHTML =
                heading(
                    role === "driver" ? "My assigned trips" : "Dispatch management",

                    role === "driver"
                        ? "Update your delivery progress"
                        : "Track dispatched trips"
                ) +

                `
                    <div class="panel">
                        ${table(
                            ["Booking", "Delivery address", "Date", "Trip status", "Actions"],
                            rows
                        )}
                    </div>
                `;

            root.querySelectorAll("[data-trip]").forEach(b => {

                b.addEventListener("click", async () => {

                    const status = b.dataset.status;

                    let body = { status };

                    if (status === "Failed") {

                        const reason = prompt(
                            "Enter failure reason (house locked / road blocked):"
                        );

                        if (!reason || reason.trim().length < 4) {
                            return alert("A reason is required.");
                        }

                        body.failureReason = reason.trim();

                    }

                    await patch("trips", b.dataset.trip, body);

                    const trip = trips.find(
                        t => t.id === Number(b.dataset.trip)
                    );

                    if (status === "Delivered" || status === "Failed") {

                        const booking = bookings.find(
                            x => x.id === trip.bookingId
                        );

                        await patch("bookings", booking.id, {
                            status
                        });

                        const tanker = tankers.find(
                            x => x.id === trip.tankerId
                        );

                        const driver = drivers.find(
                            x => x.id === trip.driverId
                        );

                        if (tanker) {
                            await patch("tankers", tanker.id, {
                                status: "Available"
                            });
                        }

                        if (driver) {
                            await patch("drivers", driver.id, {
                                status: "Available"
                            });
                        }

                    }

                    notice("Trip status updated.");
                    load();

                });

            });

        }

        // ==============================
        // Customer: Bills
        // ==============================

        else if (page === "bills") {

            const rows = bills
                .filter(b => b.customerId === user.id)
                .map(b => `
                    <tr>
                        <td>#${b.bookingId}</td>
                        <td>${money(b.amount)}</td>
                        <td>${b.date}</td>
                        <td>${statusBadge(b.status)}</td>
                    </tr>
                `)
                .join("");

            root.innerHTML =
                heading(
                    "My bills",
                    "View your booking charges"
                ) +

                `
                    <div class="panel">
                        ${table(
                            ["Booking", "Amount", "Date", "Payment status"],
                            rows
                        )}
                    </div>
                `;

        }

        // ==============================
        // Officer: Delivery Disputes
        // ==============================

        else if (page === "disputes") {

            const rows = disputes
                .filter(d => d.zoneId === user.zoneId)
                .map(d => `
                    <tr>
                        <td>#${d.bookingId}</td>
                        <td>${escapeHTML(d.customerName)}</td>
                        <td>${escapeHTML(d.reason)}</td>
                        <td>${statusBadge(d.status)}</td>

                        <td>
                            ${
                                d.status === "Open"
                                    ? `
                                        <button
                                            class="btn btn-sm btn-primary"
                                            data-dispute="${d.id}"
                                        >
                                            Resolve
                                        </button>
                                    `
                                    : "—"
                            }
                        </td>
                    </tr>
                `)
                .join("");

            root.innerHTML =
                heading(
                    "Delivery disputes",
                    "Review customer-reported delivery issues"
                ) +

                `
                    <div class="panel">
                        ${table(
                            ["Booking", "Customer", "Reason", "Status", "Action"],
                            rows
                        )}
                    </div>
                `;

            root.querySelectorAll("[data-dispute]").forEach(b => {

                b.addEventListener("click", async () => {

                    await patch(
                        "disputes",
                        b.dataset.dispute,
                        {
                            status: "Resolved"
                        }
                    );

                    notice("Dispute resolved.");
                    load();

                });

            });

        }

        // ==============================
        // Admin: Management & Reports
        // ==============================

        else if (
            ["users", "zones", "hydrants", "tankers", "rates", "reports"]
                .includes(page)
        ) {

            const map = {

                users: [
                    "Users",
                    users,
                    ["Name", "Email", "Role"],
                    x => `
                        <tr>
                            <td>${escapeHTML(x.name)}</td>
                            <td>${escapeHTML(x.email)}</td>
                            <td>${escapeHTML(x.role)}</td>
                        </tr>
                    `
                ],

                zones: [
                    "Zones",
                    zones,
                    ["Zone", "Area"],
                    x => `
                        <tr>
                            <td>${escapeHTML(x.name)}</td>
                            <td>${escapeHTML(x.area)}</td>
                        </tr>
                    `
                ],

                hydrants: [
                    "Hydrants",
                    hydrants,
                    ["Hydrant", "Zone", "Daily quota", "Used today", "Status"],
                    x => `
                        <tr>
                            <td>${escapeHTML(x.name)}</td>
                            <td>${zoneName(x.zoneId)}</td>
                            <td>${x.dailyQuota.toLocaleString()}</td>
                            <td>${x.usedToday.toLocaleString()}</td>
                            <td>${statusBadge(x.status)}</td>
                        </tr>
                    `
                ],

                tankers: [
                    "Tankers",
                    tankers,
                    ["Registration", "Capacity", "Hydrant", "Status"],
                    x => `
                        <tr>
                            <td>${escapeHTML(x.registration)}</td>
                            <td>${x.capacity.toLocaleString()} gal</td>
                            <td>${hydrantName(x.hydrantId)}</td>
                            <td>${statusBadge(x.status)}</td>
                        </tr>
                    `
                ],

                rates: [
                    "Rates & quotas",
                    rates,
                    ["Capacity", "Commercial rate", "Subsidised rate"],
                    x => `
                        <tr>
                            <td>${x.capacity.toLocaleString()} gal</td>
                            <td>${money(x.commercial)}</td>
                            <td>${money(x.subsidised)}</td>
                        </tr>
                    `
                ]

            };

            // ==============================
            // Admin Reports
            // ==============================

            if (page === "reports") {

                root.innerHTML =
                    heading(
                        "City reports",
                        "Summary across the city"
                    ) +

                    `
                        <div class="row g-3">

                            ${stat(
                                "Total bookings",
                                bookings.length,
                                "fa-calendar"
                            )}

                            ${stat(
                                "Delivered",
                                bookings.filter(
                                    b => b.status === "Delivered"
                                ).length,
                                "fa-check"
                            )}

                            ${stat(
                                "Open disputes",
                                disputes.filter(
                                    d => d.status === "Open"
                                ).length,
                                "fa-triangle-exclamation"
                            )}

                            ${stat(
                                "Total hydrant quota",
                                hydrants.reduce(
                                    (s, h) => s + h.dailyQuota,
                                    0
                                ).toLocaleString() + " gal",
                                "fa-faucet"
                            )}

                        </div>
                    `;

            } else {

                const [title, data, headers, render] = map[page];

                root.innerHTML =
                    heading(
                        title,
                        "Live records loaded from the mock API"
                    ) +

                    `
                        <div class="panel">
                            ${table(
                                headers,
                                data.map(render).join("")
                            )}
                        </div>
                    `;

            }

        }

        // ==============================
        // Page Not Found
        // ==============================

        else {

            root.innerHTML = heading(
                "Page not found",
                "Choose a page from the navigation."
            );

        }

    } catch (err) {

        root.innerHTML = `
            <div class="alert alert-danger">

                <b>Unable to load data.</b>

                <br>

                Make sure JSON Server is running at
                http://localhost:3000.

                <br>

                <small>${escapeHTML(err.message)}</small>

            </div>
        `;

    }

}

// ==============================
// Initialize Dashboard
// ==============================

load();
