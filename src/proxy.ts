const { fetch: originalFetch } = window;
window.fetch = async (...args) => {
    let [resource, config ] = args;

    // request interceptor starts
    // resource = 'https://jsonplaceholder.typicode.com/todos/2';
    console.log(`Request to ${resource}`);
    // request interceptor ends

    const response = await originalFetch(resource, config);

    // response interceptor here
    return response;
};

