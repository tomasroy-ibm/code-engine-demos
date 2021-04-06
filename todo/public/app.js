
$(document).ready(() => {
    getTodos()

    $("#todos").find("checkbox").change(() => {
        editTodo(this)
    })
    $("form").submit((event) => {
        event.preventDefault()
        createTodo($("#newTodo").val())
    })
})

function getTodos() {
    axios.get("/todos")
        .then((response) => {
            let html = "";
            for (let todo of response.data.todos) {
                html += `<div><input type="checkbox" id="${todo.id}" ${todo.complete ? 'checked' : null}/>${todo.title}</div>`
            }
            $("#todos").html(html)
        })
        .catch((err) => {
            $("#todos").html(err.response.data)
        })
}

function editTodo(todoElement) {
    axios.put("/todo", { id: todoElement.attr("id"), complete: todoElement.checked })
        .then(() => {
            getTodos()
        })
        .catch((err) => {
            $("#todos").html(err.response.data)
        })
}

function createTodo(title) {
    axios.post("/todo", { title })
        .then(() => getTodos())
        .catch((err) => {
            $("#todos").html(err.response.data)
        })
}