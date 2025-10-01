// ---- CONFIG ----
const teacherPassword = "teacher123"; // Change your teacher password here

const avatarFiles = [
  "boy.png","cancan.png","cat.png","delivery-boy.png","mushroom.png",
  "paw.png","sport-car.png","student.png","tyrannosaurus-rex.png",
  "unicorn.png","walking-the-dog.png"
];
const avatarFolder = "avatars/";

const badgeImages = {
  "gold-medal": "badge/gold-medal.png",
  "medal-": "badge/medal-.png",
  "medal": "badge/medal.png",
  "star-medal": "badge/star-medal.png",
  "trophy-star": "badge/trophy-star.png",
  "trophy": "badge/trophy.png"
};
const storyBadges = {
  1: "gold-medal",
  2: "medal-",
  3: "medal",
  4: "star-medal",
  5: "trophy-star",
  6: "trophy"
};

// ---- INIT STORAGE ----
let students = JSON.parse(localStorage.getItem("students")) || {};
let stories = JSON.parse(localStorage.getItem("stories")) || {}; // teacher added stories
let currentUser = localStorage.getItem("currentUser");

// ---- LOGIN FUNCTIONS ----
function loginAsStudent() {
  const name = document.getElementById("studentName").value.trim();
  if (!name) return alert("Enter your name!");
  localStorage.setItem("currentUser", name);

  if (!students[name]) {
    students[name] = { avatar: avatarFolder + "boy.png", badges: [], points: 0, showOnLeaderboard: true };
    localStorage.setItem("students", JSON.stringify(students));
  }
  window.location.href = "index.html";
}

function loginAsTeacher() {
  const password = prompt("Enter teacher password:");
  if (password !== teacherPassword) {
    return alert("Wrong password!");
  }
  localStorage.setItem("currentUser", "teacher");
  window.location.href = "teacher.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// ---- STUDENT DASHBOARD ----
if (document.title.includes("Student Dashboard") && currentUser && currentUser !== "teacher") {
  const student = students[currentUser];
  document.getElementById("welcomeMessage").innerText = `Welcome, ${currentUser}!`;

  // Render current avatar
  function renderCurrentAvatar() {
    document.getElementById("currentAvatar").innerHTML = `<img src="${student.avatar}" width="100">`;
  }
  renderCurrentAvatar();

  // Avatar selection (only if first login)
  const avatarContainer = document.getElementById("avatarSelection");
  if (!student.avatarChosenOnce) {
    avatarFiles.forEach(file => {
      let img = document.createElement("img");
      img.src = avatarFolder + file;
      img.width = 60;
      img.style.cursor = "pointer";
      img.onclick = () => {
        student.avatar = avatarFolder + file;
        student.avatarChosenOnce = true;
        students[currentUser] = student;
        localStorage.setItem("students", JSON.stringify(students));
        renderCurrentAvatar();
        avatarContainer.style.display = "none"; // hide after first choose
      };
      avatarContainer.appendChild(img);
    });
  } else {
    avatarContainer.style.display = "none";
  }

  // Story buttons
  Object.keys(storyBadges).forEach(storyNum => {
    const btn = document.createElement("button");
    btn.innerText = `Complete Story ${storyNum}`;
    btn.onclick = () => {
      const badge = storyBadges[storyNum];
      if (!student.badges.includes(badge)) {
        student.badges.push(badge);
        student.points += 10;
        students[currentUser] = student;
        localStorage.setItem("students", JSON.stringify(students));
        alert(`Congrats! You earned the "${badge}" badge!`);
        renderBadges();
        updateLeaderboard();
      } else {
        alert(`You already have the "${badge}" badge.`);
      }
    };
    document.querySelector("section:nth-of-type(2)").appendChild(btn);
  });

  // Render badges
  const badgeContainer = document.getElementById("studentBadges");
  function renderBadges() {
    badgeContainer.innerHTML = "";
    student.badges.forEach(b => {
      let img = document.createElement("img");
      img.src = badgeImages[b];
      img.className = "badge";
      badgeContainer.appendChild(img);
    });
  }
  renderBadges();

  // Leaderboard
  function updateLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = "";
    const sorted = Object.entries(students)
      .filter(([n, s]) => s.showOnLeaderboard)
      .sort((a,b) => b[1].points - a[1].points);
    sorted.forEach(([name, s]) => {
      let li = document.createElement("li");
      let badgeImgs = s.badges.map(b => `<img src="${badgeImages[b]}" width="20">`).join(" ");
      li.innerHTML = `<img src="${s.avatar}" width="40"> ${name} - ${s.points} pts ${badgeImgs}`;
      leaderboard.appendChild(li);
    });
  }
  updateLeaderboard();
}

// ---- TEACHER DASHBOARD ----
if (document.title.includes("Teacher Dashboard") && currentUser === "teacher") {
  const studentsList = document.getElementById("studentsList");
  const leaderboard = document.getElementById("leaderboard");

  // Render students with badges and points
  function renderStudents() {
    studentsList.innerHTML = "";
    Object.entries(students).forEach(([name, s]) => {
      let div = document.createElement("div");
      div.innerHTML = `<strong>${name}</strong> <img src="${s.avatar}" width="50"> - ${s.points} pts`;

      // Show badges
      s.badges.forEach(b => {
        let img = document.createElement("img");
        img.src = badgeImages[b];
        img.width = 25;
        div.appendChild(img);
      });

      // Leaderboard toggle
      const toggleBtn = document.createElement("button");
      toggleBtn.innerText = s.showOnLeaderboard ? "Hide" : "Show";
      toggleBtn.onclick = () => {
        s.showOnLeaderboard = !s.showOnLeaderboard;
        students[name] = s;
        localStorage.setItem("students", JSON.stringify(students));
        renderStudents();
        renderLeaderboard();
      };
      div.appendChild(toggleBtn);

      studentsList.appendChild(div);
    });
  }

  function renderLeaderboard() {
    leaderboard.innerHTML = "";
    const sorted = Object.entries(students)
      .filter(([n, s]) => s.showOnLeaderboard)
      .sort((a,b) => b[1].points - a[1].points);
    sorted.forEach(([name, s]) => {
      let li = document.createElement("li");
      li.innerHTML = `<img src="${s.avatar}" width="40"> ${name} - ${s.points} pts`;
      leaderboard.appendChild(li);
    });
  }

  renderStudents();
  renderLeaderboard();
}
