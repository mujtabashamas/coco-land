import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import LoginHeader from '../Layout/LoginHeader';
import LoginFooter from '../Layout/LoginFooter';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/userSlice';
import Face from '../assets/COCOface.svg';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const LoginPage = () => {
  const [placeName, setPlaceName] = useState(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handlePostalCodeChange = (e) => {
    formik.handleChange(e);
    const postalcode = e.target.value;
    setPlaceName('');
    formik.values.place = null;
    fetch(`/api/validate-postalcode/${postalcode}`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Postal code not found');
        }
      })
      .then((data) => {
        if (data.place) {
          formik.values.place = data.place;
          setPlaceName(data.place);
        } else {
          setPlaceName('');
          formik.values.place = null;
        }
      });
  };

  const formik = useFormik({
    initialValues: {
      pseudo: '',
      genre: '',
      age: '',
      postalcode: '',
      place: '',
      image: '',
    },
    validationSchema: Yup.object({
      pseudo: Yup.string()
        .min(4, 'Le pseudo doit comporter au moins 4 caractères')
        .required('Un Pseudo est requis'),
      genre: Yup.string()
        .oneOf(['Homme', 'Femme'], 'Le genre est requis')
        .required('Le genre est requis'),
      age: Yup.number()
        .min(0, `L'âge ne peut pas être négatif`)
        .min(18, `L'âge doit être d'au moins 18 ans`)
        .required('Age requis'),
      postalcode: Yup.string()
        .matches(/^\d{5}$/, 'Le code postal doit être composé de 5 chiffres')
        .required('Code postal requis'),
    }),
    onSubmit: (values) => {
      if (placeName) {
        const userData = { ...values, place: placeName };
        dispatch(login(userData));
        navigate('/');
      }
    },
  });

  return (
    <div className='flex flex-col overflow-y-auto'>
      <LoginHeader />

      <section className='flex items-center justify-center bg-brown h-[70vh] '>
        <div className='flex space-x-52 px-12 mx-auto'>
          <div className='bg-lightBrown py-4  px-6 rounded-lg shadow-lg w-full mx-auto max-w-sm lg:w-1/2'>
            <form onSubmit={formik.handleSubmit}>
              <div className='mb-4'>
                <label className='block text-2xl font-bold text-center mb-2'>
                  Pseudo
                </label>

                <input
                  type='text'
                  name='pseudo'
                  className={`font-verdana w-full p-2 px-4 border ${
                    formik.touched.pseudo && formik.errors.pseudo
                      ? 'border-red-500'
                      : 'border-black'
                  } rounded-xl focus:outline-none`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.pseudo}
                />
                {formik.touched.pseudo && formik.errors.pseudo ? (
                  <div className='text-white text-sm text-center'>
                    {formik.errors.pseudo}
                  </div>
                ) : null}
              </div>

              <div className='mt-6 flex justify-between mx-6  space-x-8'>
                <label className='flex items-center text-xl font-bold text-2xl'>
                  <input
                    type='radio'
                    name='genre'
                    value='Homme'
                    className='mr-2 w-5 h-5'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    checked={formik.values.genre === 'Homme'}
                  />
                  Homme
                </label>
                <label className='flex items-center text-xl font-bold text-2xl'>
                  <input
                    type='radio'
                    name='genre'
                    value='Femme'
                    className='mr-2 w-5 h-5'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    checked={formik.values.genre === 'Femme'}
                  />
                  Femme
                </label>
              </div>
              {formik.touched.genre && formik.errors.genre ? (
                <div className='text-white text-sm text-center'>
                  {formik.errors.genre}
                </div>
              ) : null}

              <div className='mt-6 flex items-center justify-center'>
                <label className='mr-4 text-2xl font-bold'>Age</label>
                <input
                  type='number'
                  name='age'
                  className={`font-semibold text-lg appearance-none w-12 p-1 border ${
                    formik.touched.age && formik.errors.age
                      ? 'border-red-500'
                      : 'border-black'
                  } rounded-lg focus:outline-none`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.age}
                />
              </div>
              {formik.touched.age && formik.errors.age ? (
                <div className='text-white text-sm text-center'>
                  {formik.errors.age}
                </div>
              ) : null}

              <div className='relative mt-4'>
                <label className='block text-2xl font-bold mb-2'>
                  Code Postal
                </label>
                <input
                  id='postalcode'
                  type='text'
                  name='postalcode'
                  className={`w-1/4 p-2 mx-4 border ${
                    formik.touched.postalcode && formik.errors.postalcode
                      ? 'border-red-500'
                      : 'border-black'
                  } rounded-lg focus:outline-none placeholder:text-black placeholder:font-bold placeholder:text-xl`}
                  onChange={(e) => handlePostalCodeChange(e)}
                  onBlur={formik.handleBlur}
                  value={formik.values.postalcode}
                />
                {placeName && (
                  <div
                    className={`absolute top-10 right-0 bg-white w-4/6 appearance-none p-2 border border-black rounded-lg font-semibold focus:outline-none ${
                      placeName ? 'block' : 'hidden'
                    }`}
                  >
                    {placeName}
                  </div>
                )}

                {/* {// <select
                  //   value={placeName}
                  //   name='place'
                  //   id='place'
                  //   className={`absolute top-10 right-0 bg-white w-4/6 appearance-none p-2 border border-black rounded-lg font-semibold focus:outline-none ${
                  //     placeName ? 'block' : 'hidden'
                  //   }`}
                  //   onChange={(e) => changePostalCode(e)}
                  // >
                  //   <option value={placeName}>{placeName}</option>
                  //   {data.map(
                  //     (code, index) =>
                  //       placeName !== code.place && (
                  //         <option key={index} value={code.place}>
                  //           {code.place}
                  //         </option>
                  //       )
                  //   )}
                  // </select>} */}
              </div>
              {formik.touched.postalcode && formik.errors.postalcode ? (
                <div className='text-white text-sm text-center'>
                  {formik.errors.postalcode}
                </div>
              ) : null}

              <div className='mt-6 flex justify-end'>
                <button
                  type='submit'
                  className='bg-gradient-to-b from-btnYellow to-yellow-100 px-6 py-2 pb-4 font-bold text-2xl rounded hover:bg-yellow-500 focus:outline-none border border-black'
                >
                  Entrér
                </button>
              </div>
            </form>
          </div>

          <div className='hidden lg:block w-1/2'>
            <img src={Face} alt='' className='h-full w-full' />
          </div>
        </div>
      </section>

      <LoginFooter />
    </div>
  );
};

export default LoginPage;
