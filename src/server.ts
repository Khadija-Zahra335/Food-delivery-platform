import app from "./app";

const PORT = 3000;
// start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});