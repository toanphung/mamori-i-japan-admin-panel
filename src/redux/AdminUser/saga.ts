import { takeEvery, all, fork } from 'redux-saga/effects';
import actionTypes from './actionTypes';
import { auth, actionCodeSettings } from '../../firebase';

function* createUserSaga() {
  yield takeEvery(actionTypes.CREATE_USER, function* _({ payload: { email } }: any) {
    yield auth.sendSignInLinkToEmail(email, actionCodeSettings)
      .then(() => {
        localStorage.setItem('emailForSignIn', email);
      }).catch((error: Error) => console.log(error));
  })

  //TODO: create admin user to firebase
}

export default function* rootSaga() {
  yield all([fork(createUserSaga)]);
}