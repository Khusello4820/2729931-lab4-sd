function submitCountry(event) {
    if (event) event.preventDefault(); // Prevent form from refreshing
    let input = document.getElementById("inp").value.trim();
    if (input) {
        getData(input);
    } else {
        alert("Please enter a valid country name.");
    }
}

async function getData(countryname) {
    const encodedCountryName = encodeURIComponent(countryname);
    const url = `https://restcountries.com/v3.1/name/${encodedCountryName}?fullText=true`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        let countryData = await response.json();
        if (!countryData || countryData.length === 0) {
            throw new Error("No country data found.");
        }

        let country = countryData[0];
        let capital = country.capital ? country.capital[0] : "N/A";
        let population = country.population ? country.population.toLocaleString() : "N/A";
        let region = country.region || "N/A";
        let flag = country.flags && country.flags.svg ? country.flags.svg : "";

        const neighbours = country.borders || [];
        const neighbourData = await Promise.all(
            neighbours.map(async (border) => {
                const neighbourResponse = await fetch(`https://restcountries.com/v3.1/alpha/${border}`);
                if (!neighbourResponse.ok) return null;
                const neighbourCountry = await neighbourResponse.json();
                return {
                    name: neighbourCountry[0].name.common,
                    flag: neighbourCountry[0].flags ? neighbourCountry[0].flags.svg : ""
                };
            })
        );

        // Ensure the correct HTML structure exists before updating elements
        document.getElementById('country-info').innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>Population:</strong> ${population}</p>
            <p><strong>Region:</strong> ${region}</p>
            <div id="flag">${flag ? `<img src="${flag}" alt="Flag of ${country.name.common}" width="300">` : "No flag available"}</div>
            <h3>Neighbouring Countries:</h3>
            <ul id="neighbours-list"></ul>
        `;

        // Populate neighbouring countries
        const neighbourhoodList = document.getElementById('neighbours-list');
        neighbourhoodList.innerHTML = ""; // Clear previous list before updating
        neighbourData.forEach(neighbour => {
            if (neighbour) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<p>${neighbour.name}</p>${neighbour.flag ? `<img src="${neighbour.flag}" alt="${neighbour.name} Flag" width="100">` : ""}`;
                neighbourhoodList.appendChild(listItem);
            }
        });

    } catch (error) {
        console.error("Error:", error.message);
        document.getElementById('country-info').innerHTML = `<p style="color: red;">Error: ${error.message}. Please try again.</p>`;
    }
}
