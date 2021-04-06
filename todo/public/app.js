
$(document).ready(() => {
    getTodos()
    $("form").submit((event) => {
        event.preventDefault()
        createTodo($("#newTodo").val())
        $("#newTodo").val("")
    })
})

function getTodos() {
    return axios.get("/todos")
        .then((response) => {
            let html = "";
            if (response.data.todos.length < 1) return $("#todos").html("No todos")
            for (let todo of response.data.todos) {
                html += `<div><input type="checkbox" id="${todo._id}" ${todo.complete ? 'checked' : null}/>${todo.title}</div>`
            }
            $("#todos").html(html)
            $("#todos").find("input").change((event) => {
                editTodo(event.currentTarget)
            })
        })
        .catch(err => $("#todos").html(err.response.data))
}

function editTodo(element) {
    return axios.patch("/todo", { id: element.id, complete: element.checked })
        .then(() => getTodos())
        .catch(err => $("#todos").html(err.response.data))
}

function createTodo(title) {
    return axios.post("/todo", { title })
        .then(() => getTodos())
        .catch(err => $("#todos").html(err.response.data))
}