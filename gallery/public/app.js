
$(document).ready(() => {
    getPictures()
    getUploadSupport()
})

function getPictures() {
    $("#gallery").html("Loading pictures...")
    return axios.get("/pictureUrls")
        .then((response) => {
            let html = ""
            const { pictureUrls } = response.data
            if (pictureUrls.length < 1) return $("#gallery").html("No pictures")
            for (let url of pictureUrls) {
                html += `<img src="${url}" />`
            }
            $("#gallery").html(html)
        })
        .catch(err => {
            if (err.response && err.response.data) {
                if (err.response.data.message) $("#gallery").html(err.response.data.message)
                else $("#gallery").html(err.response.data)
            } else $("#gallery").html("Error loading photos")
        })
}

function getUploadSupport() {
    $("#upload").click(() => alert("Uploads not implemented"))
    return axios.get("/uploadSupport")
        .then((response) => {
            if (response.data.uploads_supported) {
                $("#upload").css("display", "inline-block")
            }
        })
        .catch(err => console.error(err))
}