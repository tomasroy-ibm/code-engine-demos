
$(document).ready(() => {
    getPictures()
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
        .catch(err => $("#gallery").html(err.response.data))
}