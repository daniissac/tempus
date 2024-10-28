let countdown;
let lifeExpectancy;

async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/sw.js');
        } catch (e) {
            console.log('SW registration failed');
        }
    }
}

async function fetchLifeExpectancy() {
    const response = await fetch('data/life-expectancy.json');
    lifeExpectancy = await response.json();
}
async function populateCountries() {
    const countrySelect = document.getElementById('country');
    Object.keys(lifeExpectancy).sort().forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

function calculateEndDate(birthdate, gender, country) {
    const birth = new Date(birthdate);
    const expectancy = lifeExpectancy[country][gender];
    return new Date(birth.getFullYear() + expectancy, birth.getMonth(), birth.getDate());
}

function startTimer() {
    const gender = document.getElementById('gender').value;
    const birthdate = document.getElementById('birthdate').value;
    const country = document.getElementById('country').value;
    
    if (!birthdate) return alert('Please enter your birthdate');
    
    const endDate = calculateEndDate(birthdate, gender, country);
    
    document.getElementById('setupForm').style.display = 'none';
    document.getElementById('timer').style.display = 'block';
    
    localStorage.setItem('dtime-config', JSON.stringify({
        gender, birthdate, country, endDate: endDate.toISOString()
    }));
    
    updateTimer(endDate);
    countdown = setInterval(() => updateTimer(endDate), 1000);
}

function updateTimer(endDate) {
    const now = new Date();
    const difference = endDate - now;
    
    const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
    
    document.getElementById('timer').innerHTML = `
        ${totalDays} days
    `;
}
window.onload = async () => {
    await fetchLifeExpectancy();
    await populateCountries();
    registerSW();
    
    const saved = localStorage.getItem('dtime-config');
    if (saved) {
        const config = JSON.parse(saved);
        document.getElementById('gender').value = config.gender;
        document.getElementById('birthdate').value = config.birthdate;
        document.getElementById('country').value = config.country;
        document.getElementById('setupForm').style.display = 'none';
        document.getElementById('timer').style.display = 'block';
        updateTimer(new Date(config.endDate));
        countdown = setInterval(() => updateTimer(new Date(config.endDate)), 1000);
    }
};
