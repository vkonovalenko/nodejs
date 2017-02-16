Commands and responses

1)<br />
{"command": "profile", "data": {"api_token": "1"}}<br />
{"command":"profile","data":{"id":15,"token":"a039c628-de08-4278-b339-ffd0ac68dbdb","email":"slavik@ko.com","firstName":"slavik","lastName":"konovalenko","nickName":"koslavik","allowFriends":1,"allowRandom":1,"meetsCount":0,"unreadMessages":1},"message":""}<br />
<br />

2)<br />
{"command": "signup", "data": {"firstName": "slavik", "lastName": "konovalenko", "email": "slavik@ko.com", "password": "123", "nickName": "koslavik", "deviceOs": "android"}}<br />
{"command":"user_created","data":{"id":12,"firstName":"slavik","lastName":"konovalenko","email":"slavik@ko.com","nickName":"koslavik","token":"641faa16-6ba0-4418-8b4a-481a09ecf8c4","friends":[],"allowFriends":true,"allowRandom":true,"meetsCount":0},"message":""}<br />
<br />

3)<br />
{"command": "login", "data": {"password": "123", "nickName": "koslavik"}}<br />
{"command":"user_logined","data":{"id":15,"token":"a039c628-de08-4278-b339-ffd0ac68dbdb","email":"slavik@ko.com","firstName":"slavik","lastName":"konovalenko","nickName":"koslavik","allowFriends":1,"allowRandom":1,"meetsCount":0,"unreadMessages":1},"message":""}<br />
<br />

4)<br />
{"command": "unread_messages", "data": {"limit": "1"}}<br />
{"command":"receive_message","data":{"id":53,"message":"hello user 6","createdAt":"2017-01-28T21:34:36.000Z","sender":{"id":5,"avatar":"/asd/image.jpg"}},"message":""}<br />
<br />

5)<br />
{"command": "message", "data": {"message": "hello, user", "userTo": "15"}}<br />
{"command":"message_sent","data":{},"message":""}<br />
{"command":"recieve_message","data":{"id":67,"message":"whosg iguwuwge","createdAt":"2017-02-05T20:39:13.000Z","sender":{"id":5,"nickName":"11","avatar":""}},"message":""}<br />
<br />

6)<br />
{"command": "profile"}<br />
{"command":"profile","data":{"firstName":"Vyacheslav","lastName":"konovalenko","nickName":"Vyacheslav","email":"slavik@ko.com","allowFriends":1,"allowRandom":1,"meetsCount":0,"avatar":"/asd/test.jpg","phone":null,"unreadMessages":4,"friendRequests":0,"friendsCount":0},"message":""}<br />
<br />

7)<br />
{"command": "update_profile", "data": {"firstName": "Vyacheslav"}}<br />
{"command":"profile_updated","data":{"firstName":"Vyacheslav","lastName":"konovalenko","nickName":"slavik","email":"slavik@ko.com","allowFriends":1,"allowRandom":1,"meetsCount":0,"avatar":"/asd/test.jpg","phone":null,"unreadMessages":0,"friendRequests":0,"friendsCount":0},"message":""}<br />
<br />

8)<br />
{"command": "friends"}<br />
{"command":"friends","data":{"friends":[{"id":6,"avatar":null,"nickName":"22","wasOnline":null,"isOnline":false,"isHidden":true},{"id":5,"avatar":null,"nickName":"11","wasOnline":null,"isOnline":false,"isHidden":false}]},"message":""}<br />
<br />

9)<br />
{"command": "request_meeting", "data": {"userId": "5"}}<br />
{"command":"meeting_user_offline","data":{},"message":"Пользователь для встречи оффлайн."}<br />
{"command":"meeting_requested","data":{"meetingId":2, "userTo": 5},"message":""}<br />
{"command":"request_meeting","data":{"meetingId":2,"userFrom":15},"message":""}<br />
<br />

10)<br />
{"command": "discard_meeting", "data": {"meetingId": "2"}}<br />
{"command":"you_discarded_meeting","data":{"meetingId":2},"message":""}<br />
{"command":"meeting_discarded","data":{"meetingId":2},"message":""}<br />
<br />

11)<br />
{"command": "approve_meeting", "data": {"meetingId": "2"}}<br />
{"command":"you_approved_meeting","data":{"meetingId":2},"message":""}<br />
{"command":"meeting_approved","data":{"meetingId":2},"message":""}<br />
<br />

12)<br />
{"command": "meetings"}<br />
{"command":"meetings","data":{"meetings":[{"user":{"id":15,"nickName":"koslavik","avatar":"/asd/test.jpg"},"myRequest":false,"id":2,"expiredAt":1486850318,"timeLeft":0}]},"message":""}<br />
<br />

13)<br />
{"command": "do_meeting", "data": {"lat": "0.94501375303344304", "lon": "0.99999994039535522"}}<br />
{"command":"meeting_users","data":{"users":[{"id":5,"nickName":"11","avatar":null,"lat":"1.50000108975534374","lon":"1.20000153779983521"}]},"message":""}<br />
<br />

14)<br />
{"command": "get_locations", "data": {"lat": "1.0", "lon": "1.0", "radius": "900"}}<br />
{"command":"people","data":{"friendsNear":[{"id":"5","nickName":"asd","distance":3336.8358,"avatar":null}],"randomPeople":[]},"message":""}<br />
