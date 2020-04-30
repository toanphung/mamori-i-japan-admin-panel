import { put, takeEvery, all, fork, call } from 'redux-saga/effects';
import { replace } from 'react-router-redux';
import actionTypes from './actionTypes';
import loadingActionTypes from '../Loading/actionTypes';
import feedbackActionTypes from '../Feedback/actionTypes';
import { auth } from '../../utils/firebase';
import { login } from '../../apis';
import { sendEmailSaga } from '../Firebase/saga';

const signInWithEmailLink: any = async (email: string) => {
  const { user } = await auth.signInWithEmailLink(email, window.location.href);

  // Clear the URL to remove the sign-in link parameters.
  if (window.history && window.history.replaceState) {
    window.history.replaceState(
      {},
      document.title,
      window.location.href.split('?')[0]
    );
  }

  // Clear email from storage.
  localStorage.removeItem('emailForSignIn');

  return user;
};

function* loginSaga() {
  yield takeEvery(actionTypes.LOGIN, function* _({ payload }: any) {
    yield put({ type: loadingActionTypes.START_LOADING });

    let user;

    // Confirm the link is a sign-in with email link.
    if (auth.isSignInWithEmailLink(window.location.href)) {
      let email = localStorage.getItem('emailForSignIn');

      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again. For example:
        email = window.prompt('Please provide your email for confirmation');
      }
      // The client SDK will parse the code from the link for you.
      try {
        user = yield call(signInWithEmailLink, email);
      } catch (error) {
        yield put({
          type: feedbackActionTypes.SHOW_ERROR_MESSAGE,
          payload: { errorCode: error.code, errorMessage: error.message },
        });
      }

      if (user) {
        const defaultToken = yield call([user, user.getIdToken]);

        yield put({
          type: actionTypes.SAVE_TOKEN_SUCCESS,
          payload: { token: defaultToken },
        });

        try {
          yield call(login);

          if (auth.currentUser) {
            const accessTokenWithClaims = yield call(
              [user, user.getIdToken],
              true
            );

            localStorage.setItem('token', accessTokenWithClaims);

            yield put({
              type: actionTypes.SAVE_TOKEN_SUCCESS,
              payliad: { token: accessTokenWithClaims },
            });

            yield put({
              type: feedbackActionTypes.SHOW_SUCCESS_MESSAGE,
              payload: { successMessage: 'loginSuccess' },
            });

            // const { from }: any = { from: { pathname: '/' } }; // window.location.state ||

            yield put(replace('/'));
          }
        } catch (error) {
          yield put({
            type: feedbackActionTypes.SHOW_ERROR_MESSAGE,
            payload: { errorCode: error.status, errorMessage: error.error },
          });
        }
      }
    } else {
      const { email } = payload;

      yield call(sendEmailSaga, email);

      yield put({
        type: feedbackActionTypes.SHOW_SUCCESS_MESSAGE,
        payload: { successMessage: 'loginByAuthLink' },
      });
    }

    yield put({ type: loadingActionTypes.END_LOADING });
  });
}

function* logoutSaga() {
  yield takeEvery(actionTypes.LOGOUT, function* _() {
    yield put({ type: loadingActionTypes.START_LOADING });

    try {
      yield call([auth, auth.signOut]);

      localStorage.removeItem('token');

      yield put({
        type: actionTypes.LOGOUT_SUCCESS,
      });

      yield put({
        type: feedbackActionTypes.SHOW_SUCCESS_MESSAGE,
        payload: { successMessage: 'logoutSuccess' },
      });

      yield put(replace('/'));
    } catch (error) {
      yield put({
        type: feedbackActionTypes.SHOW_ERROR_MESSAGE,
        payload: { errorCode: error.code, errorMessage: error.message },
      });
    }

    yield put({ type: loadingActionTypes.END_LOADING });
  });
}

export default function* rootSaga() {
  yield all([fork(loginSaga), fork(logoutSaga)]);
}
