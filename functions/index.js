const {onDocumentCreated}=require('firebase-functions/v2/firestore')
const admin=require('firebase-admin')
admin.initializeApp()
const db=admin.firestore()
// When someone creates a ring, push it to the other room member's devices.
exports.sendRing=onDocumentCreated('rooms/{rid}/rings/{id}',async ev=>{
  const ring=ev.data.data()
  const room=(await db.doc(`rooms/${ev.params.rid}`).get()).data()
  const to=room?.members?.find(m=>m!==ring.from)
  if(!to)return
  const tokens=(await db.doc(`users/${to}`).get()).data()?.fcmTokens||[]
  if(!tokens.length)return
  const res=await admin.messaging().sendEachForTokens({tokens,
    data:{title:'Ring ring! 💕',body:'Your person is calling you',ringId:ev.params.id},
    webpush:{headers:{Urgency:'high',TTL:'120'}}})
  const dead=tokens.filter((_,i)=>['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(res.responses[i].error?.code))
  if(dead.length)await db.doc(`users/${to}`).update({fcmTokens:admin.firestore.FieldValue.arrayRemove(...dead)})
})
