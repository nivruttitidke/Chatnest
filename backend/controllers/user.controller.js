import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js"
import { upsertStreamUser } from "../lib/stream.js";
export async function getRecommendedUsers(req,res) {
try {
    const currentUserId = req.user.id;
    const currentUser = req.user
    const recommendedUsers = await User.find({
        $and:[
            {_id:{$ne: currentUserId}}, // exclude current user
            {_id: {$nin: currentUser.friends}} ,// exclude current user's friend
            {isOnboarded:true}
        ]
    })
    res.status(200).json( recommendedUsers);
} catch (error) {
    console.error("error in getrecommendeduser controller", error.message);
    res.status(500).json({message:"internal server error"});
}
    
};


export async function getMyFriends(req,res) {
  try {
    const user = await User.findById(req.user.id).select("friends")
    .populate("friends","fullName profilepic nativeLanguage learningLanguage");
     
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("error in get my freind controoller", error.message);
    res.status(500).json({message:"inernal server error"});
  }  
};

export async function sendFriendRequest(req,res) {
    try {
        const myId = req.user.id;
        const{ id:recipientId }= req.params;

        if(myId === recipientId) {
            return res.status(400).json({message:"you can't send friend request to yourself"});
        }

        const recipient = await User.findById(recipientId);
        if(!recipient){
            return res.status(404).json({message:"Recipient not found"});
            
        }

        if(recipient.friends.includes(myId)){
            return res.status(400).json({message:"You are already friend with this user"});
        }
        //check if request is alrady exist
        const existingRequest = await FriendRequest.findOne({
            $or:[
              {sender:myId, recipient:recipientId},
              {sender:recipientId, recipient:myId}
            ],
            
        });

        if(existingRequest){
            // console.log("Existing request found:", existingRequest);
            return res.status(400).json({
        message: "Friend request already exists"
    });
        }
        const newRequest = await FriendRequest.create({
            sender:myId,
            recipient:recipientId,
        });
        
        res.status(201).json(newRequest);
    } catch (error) {
       console.error("Error in sendFriendRequest controller",error.message);
       res.status(500).json({message:"inertnal server error"}); 
    }
};

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    if (request.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    request.status = "accepted";
    await request.save();

    // Add to friends list
    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: request.recipient },
    });

    await User.findByIdAndUpdate(request.recipient, {
      $addToSet: { friends: request.sender },
    });

    // IMPORTANT — ensure Stream users exist
    const senderUser = await User.findById(request.sender);
    const recipientUser = await User.findById(request.recipient);

    await upsertStreamUser({
      id: senderUser._id.toString(),
      name: senderUser.fullName,
      image: senderUser.profilepic || "",
    });

    await upsertStreamUser({
      id: recipientUser._id.toString(),
      name: recipientUser.fullName,
      image: recipientUser.profilepic || "",
    });

    console.log("Stream users synced");

    res.status(200).json({
      message: "Friend request accepted",
    });

  } catch (error) {
    console.error(
      "error in acceptfriendrequest controller",
      error.message
    );

    res.status(500).json({
      message: "internal server error",
    });
  }
}

export async function getFriendRequest(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status:"pending",    
        }).populate("sender","fullName profilepic nativeLanguage learningLanguage");

        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status:"accepted",
        }).populate("recipient","fullName profilepic nativeLanguage learningLanguage ");

        res.status(200).json({incomingReqs, acceptedReqs});
    } catch (error) {
        console.error("error in getpending request controller", error.message);
        res.status(500).json({message:"internal server error"});
    };
}

export async function getOutgoingFriendReqs(req,res) {
   try {
    const outgoingReqs = await FriendRequest.find({
        sender:req.user.id,
        status:"pending",
    }).populate("recipient","fullName profilepic nativeLanguage learningLanguage ");

    res.status(200).json(outgoingReqs);
   } catch (error) {
    console.error("Error in outgoinreqs controller", error.message);
    res.status(500).json({message:"internal serverr error"});
   } 
}