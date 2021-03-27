$(document).ready(() => {
    let questionModal = new bootstrap.Modal(document.getElementById('question-modal'))

    let categoriesList = []
    let categoryID = 0
    let openQuestion = true
    let correctAnswer = 0

    const fillCategoriesContainer = data => {
        // initialize variable
        let catContainer = '<div class="row row-cols-1 row-cols-md-4 g-4">'

        for (let categories of data) {
            catContainer += `<div class="col">
    <div class="card bg-warning h-100">
        <div class="card-body">
            <a href="#${categories.id}" class="btn stretched-link">${categories.name}</a>
        </div>
    </div>
</div>`
        }

        catContainer += '</div>'

        // fill the select element
        $('#categories-container').html(catContainer)

        $('.card-body .btn').on('click', function(e) {
            e.preventDefault()

            categoryID = $(this).attr('href').substr(1)

            fetchQuestion(categoryID)
        })
    }

    const fetchCategories = () => {
        try {
            fetch(`https://opentdb.com/api_category.php`)
            .then(response => {
                // check for response status
                if (response.status != 200) throw Error(response.status)

                return response.json()
            })
            .then(data => {
                // console.log(data)
                // categoriesList = data.trivia_categories.map(value => ({...value}))
                categoriesList = [...data.trivia_categories]
                categoriesList.sort((a, b) => (a.name > b.name) ? 1 : -1)

                fillCategoriesContainer(categoriesList)
            })
            .catch(error => {
                alert(`Oops, something went wrong! (${error})`)
            })
        }
        catch(err) {
            alert(err)
        }
    }

    const resetElementsModal = () => {
        $('#modal-next-question').attr('disabled', true)
        $('#modal-result').html('')
        $('.modal-answer-container').removeClass('hover-disabled')
        $('.modal-answer-text').removeClass('alert-danger').removeClass('alert-success')

        openQuestion = true
    }

    const fillQuestionModal = (data) => {
        // console.log(data)

        // reset the elements on the modal window
        resetElementsModal()

        // fill the fields
        $('#modal-category').html(data.category)
        $('#modal-question').html(data.question)

        // store the incorrect answers
        let getAnswers = [...data.incorrect_answers]

        // pick a random number from 0 to 2
        const randomIndex = Math.floor(Math.random() * 3)

        // add the correct answer according the random number
        getAnswers.splice(randomIndex, 0, data.correct_answer)

        // store the ID of the correct answer
        correctAnswer = randomIndex + 1

        // fill the answers
        $('.modal-answer-text').each(function(index) {
            $(this).html(getAnswers[index])
        })

        questionModal.show()
    }

    const fetchQuestion = catID => {
        try {
            fetch(`https://opentdb.com/api.php?amount=1&category=${catID}&difficulty=easy&type=multiple`)
            .then(response => {
                // check for response status
                if (response.status != 200) throw Error(response.status)

                return response.json()
            })
            .then(data => {
                // check if the response was successfull
                if (data.response_code != 0) {
                    let msgError = ''

                    switch(data.response_code) {
                        case 1:
                            msgError = `Could not return results. The API doesn't have enough questions for your query.`
                            break

                        case 2:
                            msgError = `Contains an invalid parameter. Arguements passed in aren't valid.`
                            break

                        case 3:
                            msgError = `Session Token does not exist.`
                            break

                        case 4:
                            msgError = `Session Token has returned all possible questions for the specified query. Resetting the Token is necessary.`
                            break
                    }

                    throw Error(`${msgError}`)
                }

                fillQuestionModal(data.results[0])
            })
            .catch(error => {
                alert(`Oops, something went wrong! (${error})`)
            })
        }
        catch(err) {
            alert(err)
        }
    }

    fetchCategories()

    $('.modal-answer-container').on('click', function(e) {
        // check if the question is open
        if (openQuestion && !$(this).find('.modal-answer-text').hasClass('alert-danger')) {
            const selectedAnswer = $(this).attr('data-number')

            if (selectedAnswer == correctAnswer) {
                $('.modal-answer-text').addClass('alert-danger')
                $(this).find('.modal-answer-text').removeClass('alert-danger').addClass('alert-success')

                // show the message
                $('#modal-result').stop(true, true).html('Great job! Try another question')

                $('#modal-next-question').attr('disabled', false)
                $('.modal-answer-container').addClass('hover-disabled')
                openQuestion = false
            }
            else {
                $(this).find('.modal-answer-text').addClass('alert-danger')
                $(this).addClass('hover-disabled')

                // show the message
                $('#modal-result').stop(true, true).html('Sorry, you missed!')

                // setTimeout(() => {
                    $('#modal-result').animate({'opacity': 0}, 3000, () => $('#modal-result').html('').css('opacity', 1))
                // }, 2000)
            }
        }
    })

    // Next question button click
    $('#modal-next-question').click(e => fetchQuestion(categoryID))
});