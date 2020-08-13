window.onload = async () => {
    // document.getElementById("convertAndUpload").addEventListener("click", () => {
    //     alert('Hello World')
    // })

    await document.getElementById('file').addEventListener('change', async (e) => {
        // Convert file to base64 in order to send to server for labelling
        const fileToBase64 = async (file) =>
            new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onload = () => resolve(reader.result)
                reader.onerror = (e) => reject(e)
            }).then(async (base64Image) => {
                return await fetch('./identify-food', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                      },
                    body: JSON.stringify({image: base64Image})
                })
                .then(async (res) => {
                    return res.json()
                })
            })

        const file = event.srcElement.files[0]
        const fileConverted = await fileToBase64(file)

        console.log(fileConverted)

        // ^^^ append these to document body in a form 

    })
};
