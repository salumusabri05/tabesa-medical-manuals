document.querySelector('.form-inline').addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.querySelector('.form-control').value.toLowerCase();
    // Implement search logic here
    console.log(query);
});
