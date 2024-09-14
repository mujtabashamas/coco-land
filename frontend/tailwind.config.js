/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ], theme: {
    extend: {
      colors: {
        brown: '#755b4d',
        mediumBrown: '#c4b1a5',
        lightBrown: '#ad9383',
        btnYellow: '#f2c962',
        lilac: '#b9b5df',
        lightLilac: '#cbc5ef',
        darkLilac: '#9798dc',
        pinkRose: '#de98ba',
        tabColor: '#c7666a',
        darkBlue: 'rgb(82, 82, 94)',
        unseenYellow: 'rgb(240, 209, 18)',
        pastelPink: 'rgb(214, 171, 195)',
        grayishBrown: 'rgb(127, 107, 95)'
      },
      fontFamily: {
        verdana: ['Verdana', 'sans-serif']
      }
    },
  },
  plugins: [],
}

// Background Brown (Main Background Color): #A58863
// Darker Brown (Header and Input Box Background): #8A6755
// Light Beige (Input Field Background): #F0E6D2
// Yellow (Button Background): #FFD700
// Dark Brown (Text and Borders): #4B3621
// White (Text in Header and Logo Face): #FFFFFF
