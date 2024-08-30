import React, {useState}  from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { login } from '../features/userSlice';
import { useNavigate } from 'react-router-dom';
import LoginHeader from '../Layout/LoginHeader';
import LoginFooter from '../Layout/LoginFooter';
import Face from '../assets/COCOface.svg'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {postalcode} from '../data/zipcodes.fr.jsx'

const LoginPage = () => {
  const [placeName, setPlaceName] = useState('')
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      pseudo: '',
      genre: '',
      age: '',
      postalcode: '',
    },
    validationSchema: Yup.object({
      pseudo: Yup.string()
        .min(4, 'Psuedo must be at least 4 characters')
        .required('Pseudo is required'),
      genre: Yup.string()
        .oneOf(['Homme', 'Femme'], 'Genre is required')
        .required('Genre is required'),
      age: Yup.number()
        .min(0, 'Age cannot be negative')
        .min(18, 'Age must be at least 18')
        .required('Age is required'),
      postalcode: Yup.string()
        .matches(/^\d{5}$/, 'Postal code must be 5 digits')
        .required('Postal code is required')
        .test('valid-postalcode', 'Postal code is incorrect', function (value) {
          return postalcode.some((item) => item.zipcode === value);
        }),
    }),
    onSubmit: (values) => {
      const place = postalcode.find((item) => item.zipcode === values.postalcode)?.place;
      setPlaceName(place);
      dispatch(login(values));
      navigate('/');
    },
  });


  

  return (
    <div className='flex flex-col'> 
      <LoginHeader />

      <section className='flex items-center justify-center bg-brown h-[70vh] '> 
        <div className="flex space-x-52 px-12 mx-auto">
          <div className="bg-lightBrown py-4  px-6 rounded-lg shadow-lg w-full mx-auto max-w-sm lg:w-1/2">
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-4">
                
                <label className="block text-2xl font-bold text-center mb-2">Pesudo</label>
                
                <input 
                  type="text"
                  name='pseudo' 
                  className={`font-verdana w-full p-2 px-4 border ${formik.touched.pseudo && formik.errors.pseudo ? 'border-red-500' : 'border-black'} rounded-xl focus:outline-none`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.pseudo}
                />
                {formik.touched.pseudo && formik.errors.pseudo ? (
                  <div className="text-white text-sm text-center">{formik.errors.pseudo}</div>
                ) : null}
                
                
              </div>

              <div className="mt-6 flex justify-between mx-6  space-x-8">
                <label className="flex items-center text-xl font-bold text-2xl">
                  <input
                    type="radio"
                    name="genre"
                    value="Homme"
                    className="mr-2 w-5 h-5"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    checked={formik.values.genre === 'Homme'}
                  />
                  Homme
                </label>
                <label className="flex items-center text-xl font-bold text-2xl">
                  <input
                    type="radio"
                    name="genre"
                    value="Femme"
                    className="mr-2 w-5 h-5"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    checked={formik.values.genre === 'Femme'}
                  />
                  Femme
                </label>
              </div>
              {formik.touched.genre && formik.errors.genre ? (
                <div className="text-white text-sm text-center">{formik.errors.genre}</div>
              ) : null}

              <div className="mt-6 flex items-center justify-center">
                <label className="mr-4 text-2xl font-bold">Age</label>
                <input
                  type="number"
                  name="age"
                  className={`font-semibold text-lg appearance-none w-12 p-1 border ${formik.touched.age && formik.errors.age ? 'border-red-500' : 'border-black'} rounded-lg focus:outline-none`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.age}
                />
              </div>
              {formik.touched.age && formik.errors.age ? (
                <div className="text-white text-sm text-center">{formik.errors.age}</div>
              ) : null}

              <div className="mt-4">
                <label className='block text-2xl font-bold mb-2'>Code Postal</label>
                <input
                  type="text"
                  name="postalcode"
                  className={`w-1/4 p-2 mx-4 border ${formik.touched.postalcode && formik.errors.postalcode ? 'border-red-500' : 'border-black'} rounded-lg focus:outline-none placeholder:text-black placeholder:font-bold placeholder:text-xl`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.postalcode}
                />
                <div>{placeName}</div>
              </div>
              {formik.touched.postalcode && formik.errors.postalcode ? (
                <div className="text-white text-sm text-center">{formik.errors.postalcode}</div>
              ) : null}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-b from-btnYellow to-yellow-100 px-6 py-2 pb-4 font-bold text-2xl rounded hover:bg-yellow-500 focus:outline-none border border-black"
                >
                  Entrée
                </button>
              </div>
            </form>
          </div>

          <div className='hidden lg:block w-1/2'>
            <img src={Face} alt="" className='h-full w-full'/>
          </div>
        </div>
      </section>

      <LoginFooter />
    </div>
  );
};

export default LoginPage;
