
import {
    get,
    post
} from "./api.js";

// ==============================
// DOM Elements
// ==============================

const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const message = document.querySelector("#formMessage");

// ==============================
// Login Functionality
// ==============================

if (loginForm) {

    loginForm.addEventListener("submit", async e => {

        e.preventDefault();

        message.textContent = "";

        if (!loginForm.reportValidity()) return;

        try {

            // Fetch Users
            const users = await get("users");

            // Find Matching User
            const user = users.find(
                u =>
                    u.email.toLowerCase() ===
                    document.querySelector("#email").value.trim().toLowerCase() &&

                    u.password ===
                    document.querySelector("#password").value
            );

            // Check User Credentials
            if (!user) {
                throw new Error("Email or password is incorrect.");
            }

            // Save User Session
            sessionStorage.setItem(
                "paanilinkUser",
                JSON.stringify(user)
            );

            // Redirect to Dashboard
            location.href = `pages/dashboard.html?role=${encodeURIComponent(user.role)}`;

        } catch (err) {

            message.textContent =
                err.message.includes("fetch")
                    ? "Cannot connect to mock API. Start JSON Server first."
                    : err.message;

        }

    });

}

// ==============================
// Registration Functionality
// ==============================

if (registerForm) {

    // ==============================
    // Load Available Zones
    // ==============================

    (async () => {

        try {

            const zones = await get("zones");

            document.querySelector("#zoneId").innerHTML =
                '<option value="">Select zone</option>' +

                zones.map(z => `
                    <option value="${z.id}">
                        ${z.name}
                    </option>
                `).join("");

        } catch {

            document.querySelector("#zoneId").innerHTML =
                '<option value="">API unavailable</option>';

        }

    })();

    // ==============================
    // Register New Customer
    // ==============================

    registerForm.addEventListener("submit", async e => {

        e.preventDefault();

        message.textContent = "";

        if (!registerForm.reportValidity()) return;

        try {

            // Fetch Existing Users
            const users = await get("users");

            const email = document
                .querySelector("#regEmail")
                .value
                .trim();

            // Check Duplicate Email
            if (
                users.some(
                    u => u.email.toLowerCase() === email.toLowerCase()
                )
            ) {

                throw new Error(
                    "This email is already registered."
                );

            }

            // Create New Customer
            const user = await post("users", {

                name: document
                    .querySelector("#name")
                    .value
                    .trim(),

                email,

                password: document
                    .querySelector("#regPassword")
                    .value,

                role: "customer",

                cnic: document
                    .querySelector("#cnic")
                    .value,

                phone: document
                    .querySelector("#phone")
                    .value,

                address: document
                    .querySelector("#address")
                    .value
                    .trim(),

                zoneId: Number(
                    document.querySelector("#zoneId").value
                )

            });

            // Save User Session
            sessionStorage.setItem(
                "paanilinkUser",
                JSON.stringify(user)
            );

            // Redirect to Customer Dashboard
            location.href = "pages/dashboard.html?role=customer";

        } catch (err) {

            message.textContent = err.message;

        }

    });

}
