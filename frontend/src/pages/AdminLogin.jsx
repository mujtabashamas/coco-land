import React from 'react';
import { useAppDispatch } from '../store/store';
import { login } from '../features/userSlice';
import { useNavigate } from 'react-router-dom';
import LoginHeader from '../Layout/LoginHeader';
import LoginFooter from '../Layout/LoginFooter';
import Face from '../assets/COCOface.svg';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AdminLoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: (values) => {
      dispatch(login(values));
      navigate('/admin');
    },
  });

  return (
    <div className='flex flex-col'>
      <LoginHeader />

      <section className='flex items-center justify-center bg-brown h-[70vh] '>
        <div className='flex space-x-52 px-12 mx-auto'>
          <div className='bg-lightBrown py-4 px-6 rounded-lg shadow-lg w-full mx-auto max-w-sm lg:w-1/2'>
            <form onSubmit={formik.handleSubmit}>
              {/* Email Field */}
              <div className='mb-4'>
                <label className='block text-2xl font-bold mb-2'>Email</label>
                <input
                  type='email'
                  name='email'
                  className={`font-verdana w-full p-2 px-4 border ${
                    formik.touched.email && formik.errors.email
                      ? 'border-red-500'
                      : 'border-black'
                  } rounded-xl focus:outline-none`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  placeholder='abc@email.com'
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className='text-white text-sm text-center'>
                    {formik.errors.email}
                  </div>
                ) : null}
              </div>

              {/* Password Field */}
              <div className='mt-4'>
                <label className='block text-2xl font-bold mb-2'>
                  Password
                </label>
                <input
                  type='password'
                  name='password'
                  className={`font-verdana w-full p-2 px-4 border ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500'
                      : 'border-black'
                  } rounded-xl focus:outline-none`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  placeholder='********'
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className='text-white text-sm text-center'>
                    {formik.errors.password}
                  </div>
                ) : null}
              </div>

              {/* Submit Button */}
              <div className='mt-12 flex justify-end'>
                <button
                  type='submit'
                  className='bg-gradient-to-b from-btnYellow to-yellow-100 px-6 py-2 pb-4 font-bold text-2xl rounded hover:bg-yellow-500 focus:outline-none border border-black'
                >
                  Entrée
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

export default AdminLoginPage;
