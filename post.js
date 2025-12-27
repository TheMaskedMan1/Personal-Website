// Check login status before allowing any actions
function checkLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

const imageInput = document.getElementById("imageInput");
const descriptionInput = document.getElementById("description");
const postBtn = document.getElementById("postBtn");
const postsContainer = document.getElementById("postsContainer");

// Load posts on page load
let posts = JSON.parse(localStorage.getItem("posts")) || [];
renderPosts();

postBtn.addEventListener("click", () => {
    if (!checkLogin()) return;
    
    if (imageInput.files.length === 0 && descriptionInput.value.trim() === "") {
        return;
    }

    const images = [];

    const files = Array.from(imageInput.files);
    let loaded = 0;

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            images.push(e.target.result);
            loaded++;

            if (loaded === files.length) {
                savePost(images);
            }
        };
        reader.readAsDataURL(file);
    });

    if (files.length === 0) {
        savePost([]);
    }
});

function savePost(images) {
    if (!checkLogin()) return;
    
    const newPost = {
        id: Date.now(),
        images,
        description: descriptionInput.value,
        likes: 0,
        username: JSON.parse(localStorage.getItem('userSession')).username,
        timestamp: new Date().toISOString()
    };

    posts.unshift(newPost); // newest first
    localStorage.setItem("posts", JSON.stringify(posts));

    imageInput.value = "";
    descriptionInput.value = "";

    renderPosts();
}

function renderPosts() {
    postsContainer.innerHTML = "";

    posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.className = "post";

        const postHeader = document.createElement("div");
        postHeader.style.display = "flex";
        postHeader.style.justifyContent = "space-between";
        postHeader.style.marginBottom = "10px";
        postHeader.style.fontSize = "14px";
        postHeader.style.opacity = "0.8";
        
        const userSpan = document.createElement("span");
        userSpan.textContent = `👤 ${post.username || 'Anonymous'}`;
        
        const timeSpan = document.createElement("span");
        if (post.timestamp) {
            const date = new Date(post.timestamp);
            timeSpan.textContent = date.toLocaleDateString();
        }
        
        postHeader.appendChild(userSpan);
        postHeader.appendChild(timeSpan);

        const imagesDiv = document.createElement("div");
        imagesDiv.className = "post-images";

        post.images.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            imagesDiv.appendChild(img);
        });

        const desc = document.createElement("p");
        desc.textContent = post.description;
        desc.style.marginTop = "15px";

        const actions = document.createElement("div");
        actions.className = "post-actions";

        const likeBtn = document.createElement("button");
        likeBtn.className = "like-btn";
        likeBtn.textContent = `❤️ ${post.likes}`;

        likeBtn.onclick = () => {
            if (!checkLogin()) return;
            post.likes++;
            updateStorage();
            renderPosts();
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.onclick = () => {
            if (!checkLogin()) return;
            posts = posts.filter(p => p.id !== post.id);
            updateStorage();
            renderPosts();
        };

        actions.appendChild(likeBtn);
        actions.appendChild(deleteBtn);

        postDiv.appendChild(postHeader);
        postDiv.appendChild(imagesDiv);
        postDiv.appendChild(desc);
        postDiv.appendChild(actions);

        postsContainer.appendChild(postDiv);
    });
}

function updateStorage() {
    localStorage.setItem("posts", JSON.stringify(posts));
}

// Add notification when post is created (add inside savePost function after creating newPost)
// In the savePost function, after creating the newPost object, add:

// Get email settings
const emailSettings = JSON.parse(localStorage.getItem('emailSettings')) || { notifications: true, likes: true };

// Add notification for new post
if (emailSettings.notifications) {
    addNotification(
        'New Post Created!',
        `You created a new post: "${descriptionInput.value.substring(0, 50)}${descriptionInput.value.length > 50 ? '...' : ''}"`,
        'post'
    );
}