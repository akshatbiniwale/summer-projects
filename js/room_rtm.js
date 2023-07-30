let handleMemberJoined = async (memberId) => {
    console.log("New member has joined!", memberId);
    addMemberToDOM(memberId);

    let members = await channel.getMembers();
    updateMemberTotal(members);
};

let addMemberToDOM = async (memberId) => {
    let { name } = await rtmClient.getUserAttributesByKeys(memberId, ["name"]);

    let membersWrapper = document.getElementById("member__list");
    let memberItem = `<div class="member__wrapper" id="member__${memberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`;

    membersWrapper.insertAdjacentHTML("beforeend", memberItem);
};

let updateMemberTotal = async (members) => {
    let total = document.getElementById("members__count");
    total.innerText = members.length;
};

let handleMemberLeft = async (memberId) => {
    removeMemberFromDOM(memberId);

    let members = await channel.getMembers();
    updateMemberTotal(members);
};

let removeMemberFromDOM = async (memberId) => {
    let membersWrapper = document.getElementById(
        `member__${memberId}__wrapper`
    );
    membersWrapper.remove();
};

let getMembers = async () => {
    let members = await channel.getMembers();
    updateMemberTotal(members);

    for (let i = 0; i < members.length; i++) {
        addMemberToDOM(members[i]);
    }
};

let leaveChannel = async () => {
    await channel.leave();
    await rtmClient.logout();
};

window.addEventListener("beforeunload", leaveChannel);
