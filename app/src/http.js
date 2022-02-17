async function get(url, type = 'json') {
  const res = await fetch(url).then( response => {
    if (type == "json") return response.json();
    else return response.text();
  })
  .catch( error => {
    throw new Error(error);
  });

  return res;
}

async function post(url, type = 'json', data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then( response => {
    if (type == "json") return response.json();
    else return response.text();
  })
  .catch( error => {
    throw new Error(error);
  });

  return res;
}

export {get, post}
