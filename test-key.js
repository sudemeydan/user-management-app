const apiKey = "AIzaSyDdSPj1uFwRE1AtdC2eJiH03wQx3vYQkfI";

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("API Hatası:", data.error.message);
        } else {
            console.log("Erişilebilen Modeller:");
            data.models.forEach(m => console.log(m.name));
        }
    })
    .catch(err => console.error(err));