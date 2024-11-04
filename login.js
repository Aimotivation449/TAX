function handleLogin(event) {
    event.preventDefault();

    // Mock authentication
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "75BNBSF" && password === "Bsf@1234") {
        window.location.href = "calculator.html"; // Redirect to main page
    } else {
        alert("Invalid username or password. Please try again.");
    }
}

function openChangePasswordModal() {
    document.getElementById("changePasswordModal").style.display = "block";
}

function closeChangePasswordModal() {
    document.getElementById("changePasswordModal").style.display = "none";
}

function handleChangePassword(event) {
    event.preventDefault();
    // Handle password change functionality
    alert("Password changed successfully!");
    closeChangePasswordModal();
}
