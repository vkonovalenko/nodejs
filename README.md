Commands and responses for mobile developers

1)<br />
{"command": "profile", "data": {"api_token": "1"}}<br />
{"command":"profile","data":{"id":15,"token":"a039c628-de08-4278-b339-ffd0ac68dbdb","email":"slavik@ko.com","firstName":"slavik","lastName":"konovalenko","nickName":"koslavik","allowFriends":1,"allowRandom":1,"meetsCount":0,"unreadMessages":1},"message":""}<br />
<br /><br />

2)
{"command": "signup", "data": {"firstName": "slavik", "lastName": "konovalenko", "email": "slavik@ko.com", "password": "123", "nickName": "koslavik", "deviceOs": "android"}}
{"command":"user_created","data":{"id":12,"firstName":"slavik","lastName":"konovalenko","email":"slavik@ko.com","nickName":"koslavik","token":"641faa16-6ba0-4418-8b4a-481a09ecf8c4","friends":[],"allowFriends":true,"allowRandom":true,"meetsCount":0},"message":""}


3)
{"command": "login", "data": {"password": "123", "nickName": "koslavik"}}
{"command":"user_logined","data":{"id":15,"token":"a039c628-de08-4278-b339-ffd0ac68dbdb","email":"slavik@ko.com","firstName":"slavik","lastName":"konovalenko","nickName":"koslavik","allowFriends":1,"allowRandom":1,"meetsCount":0,"unreadMessages":1},"message":""}


4)
{"command": "unread_messages", "data": {"limit": "1"}}
{"command":"receive_message","data":{"id":53,"message":"hello user 6","createdAt":"2017-01-28T21:34:36.000Z","sender":{"id":5,"avatar":"/asd/image.jpg"}},"message":""}


5)
{"command": "message", "data": {"message": "hello, user", "userTo": "15"}}
{"command":"message_sent","data":{},"message":""}
{"command":"recieve_message","data":{"id":67,"message":"whosg iguwuwge","createdAt":"2017-02-05T20:39:13.000Z","sender":{"id":5,"nickName":"11","avatar":""}},"message":""}


6)
{"command": "profile"}
{"command":"profile","data":{"firstName":"Vyacheslav","lastName":"konovalenko","nickName":"Vyacheslav","email":"slavik@ko.com","allowFriends":1,"allowRandom":1,"meetsCount":0,"avatar":"/asd/test.jpg","phone":null,"unreadMessages":4,"friendRequests":0,"friendsCount":0},"message":""}


7)
{"command": "update_profile", "data": {"firstName": "Vyacheslav"}}
{"command":"profile_updated","data":{"firstName":"Vyacheslav","lastName":"konovalenko","nickName":"slavik","email":"slavik@ko.com","allowFriends":1,"allowRandom":1,"meetsCount":0,"avatar":"/asd/test.jpg","phone":null,"unreadMessages":0,"friendRequests":0,"friendsCount":0},"message":""}


8)
{"command": "friends"}
{"command":"friends","data":{"friends":[{"id":6,"avatar":null,"nickName":"22","wasOnline":null,"isOnline":false,"isHidden":true},{"id":5,"avatar":null,"nickName":"11","wasOnline":null,"isOnline":false,"isHidden":false}]},"message":""}


9)
{"command": "request_meeting", "data": {"userId": "5"}}
{"command":"meeting_user_offline","data":{},"message":"Пользователь для встречи оффлайн."}
{"command":"meeting_requested","data":{"meetingId":2, "userTo": 5},"message":""}
{"command":"request_meeting","data":{"meetingId":2,"userFrom":15},"message":""}


10)
{"command": "discard_meeting", "data": {"meetingId": "2"}}
{"command":"you_discarded_meeting","data":{"meetingId":2},"message":""}
{"command":"meeting_discarded","data":{"meetingId":2},"message":""}


11)
{"command": "approve_meeting", "data": {"meetingId": "2"}}
{"command":"you_approved_meeting","data":{"meetingId":2},"message":""}
{"command":"meeting_approved","data":{"meetingId":2},"message":""}


12)
response
{"command":"do_set_location","data":{},"message":""}


13)
{"command": "meetings"}
{"command":"meetings","data":{"meetings":[{"user":{"id":15,"nickName":"koslavik","avatar":"/asd/test.jpg"},"myRequest":false,"id":2,"expiredAt":1486850318,"timeLeft":0}]},"message":""}


14)
{"command": "do_meeting", "data": {"lat": "0.94501375303344304", "lon": "0.99999994039535522"}}
{"command":"meeting_users","data":{"users":[{"id":5,"nickName":"11","avatar":null,"lat":"1.50000108975534374","lon":"1.20000153779983521"}]},"message":""}


15)
{"command": "get_locations", "data": {"lat": "1.0", "lon": "1.0", "radius": "900"}}
{"command":"people","data":{"friendsNear":[{"id":"5","nickName":"asd","distance":3336.8358,"avatar":null}],"randomPeople":[]},"message":""}
