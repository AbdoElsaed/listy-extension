let addItemForm = document.querySelector(".add-item-form");
let listItemInput = document.querySelector("#list-item-input");
let listFormSubmitBtn = document.getElementById("listFormSubmitBtn");
let listForm = document.getElementById("listForm");
let loginForm = document.getElementById("loginForm");
let username = document.getElementById("username");
let alert = document.getElementById("alert");
let logoutBtn = document.getElementById("logoutBtn");




/////////////////////////////////////////  API /////////////////////////////////////// 

const API = "https://listy.cf/api/v1";

const login = async (user) => {
  const res = await fetch(`${API}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const data = await res.json();
  return data;
};


const addItem = async ({ data, token }) => {
  const res = await fetch(`${API}/item`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(data),
  });

  const item = await res.json();
  return item;
};

const getMyLists = async (token) => {
  const res = await fetch(`${API}/list/ext`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });
  const lists = await res.json();
  return lists;
};


//////////////////////////////////////////////////////////////////////////////////////////// 




chrome.storage.sync.get("logged", ({ logged }) => {
    if(logged) {
        listForm.style.display = 'block';
        loginForm.style.display = 'none';
        logoutBtn.style.display = 'block';

        // loadLists
        chrome.storage.sync.get("token", async ({ token }) => {
          await loadLists(token);
        })

    } else {
        listForm.style.display = 'none';
        loginForm.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
});

chrome.storage.sync.get("user", ({ user }) => {
  if(user) {
    username.innerHTML = user.name;
  }
});

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  if (listItemInput) {
    listItemInput.value = tabs[0].url;
  }
});

// load lists function
const loadLists = async (token) => {
  const data = await getMyLists(token);
  const lists = data.map(list => list.title)
  chrome.storage.sync.set({ lists })
}


// login submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const data = { email, password };

    const res = await login(data);

    const user = res && res.user ? res.user : null;
    const token = res && res.token ? res.token : null;
    chrome.storage.sync.set({ user });
    chrome.storage.sync.set({ token });
    chrome.storage.sync.set({ logged: true });


    username.innerHTML = user.name;
    if(user && token) {
      listForm.style.display = 'block';
      loginForm.style.display = 'none';
      logoutBtn.style.display = 'block';
    }


})

// logout function
logoutBtn.addEventListener('click', () => {
  chrome.storage.sync.set({ user: null });
  chrome.storage.sync.set({ token: null });
  chrome.storage.sync.set({ logged: false });
  chrome.storage.sync.set({ lists: null });

  username.innerHTML = 'Anonymous';

  listForm.style.display = 'none';
  loginForm.style.display = 'block';
  logoutBtn.style.display = 'none';
})



// list submit
listForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const link = e.target.link.value;
  const list = e.target.list.value;
  const tags = e.target.tags.value;
  const type = e.target.type.value;

  const data = { link, list, tags, type };

  chrome.storage.sync.get("token", async ({ token }) => {
    await addItem({ data, token });
    alert.style.opacity = 1;
    setTimeout(() => {
      alert.style.opacity = 0;
    }, 2000)

  })

});



















function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    var a,
      b,
      i,
      val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function (e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
      /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

/*An array containing all the country names in the world:*/
chrome.storage.sync.get("lists", ({ lists }) => {
  if(lists) {
    autocomplete(document.getElementById("list-input"), lists);
  }
}); 

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/



// fabBtn.addEventListener("click", () => {
//   if (fabBtn.classList.contains("active")) {
//     fabBtn.classList.remove("active");
//     addIcon.classList.remove("fa-times");
//     addIcon.classList.add("fa-plus");
//   } else {
//     fabBtn.classList.add("active");
//     addIcon.classList.remove("fa-plus");
//     addIcon.classList.add("fa-times");
//   }
// });

// currentTabBtn.addEventListener("click", () => {
//   chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
//     console.log(tabs[0].url);
//     addItemForm.style.display = "block";
//     listItemInput.value = tabs[0].url;
//   });
// });

// newTabBtn.addEventListener("click", () => {
//   addItemForm.style.display = "block";
//   listItemInput.value = "";
// });