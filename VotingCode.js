'use strict';
let sum = (total, current) => { return Number(total) + Number(current); };
function getOccurenceCountsInArray(inputArray) {
    let CountMap = new Map();
    for (let element of inputArray) {
        if (CountMap.has(element)) {
            CountMap.set(element, CountMap.get(element) + 1);
        }
        else {
            CountMap.set(element, 1);
        }
    }
    return CountMap;
}
const redColor = "#f44336";
const greenColor = "#85ff89";
const yellowColor = "#ffe600";
function voteTokensToVotes(voteTokens) {
    return Math.floor(Math.sqrt(voteTokens));
}
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { questionsToDecide: [{ text: "Best starter pokemon?", options: ["Charmander", "Squirtle", "Bulbasaur"] },
                { text: "Best caffeinated drink?", options: ["Coffee", "Tea"] }],
            voterList: [{ name: "Voter 1", remainingVoteBudget: 0, votes: [] },
                { name: "Voter 2", remainingVoteBudget: 0, votes: [] }],
            voteBudget: 100,
            currentVoterNumber: -1,
            voteState: "Setup" };
    }
    addVoteQuestion() {
        this.state.questionsToDecide.push({ text: "", options: ["", ""] });
        this.setState({ questionsToDecide: this.state.questionsToDecide });
    }
    removeVoteQuestion(questionNumber) {
        let tempQuestions = this.state.questionsToDecide;
        tempQuestions.splice(questionNumber, 1);
        this.setState({ questionsToDecide: tempQuestions });
    }
    addVoteOptionToQuestion(questionNumber) {
        this.state.questionsToDecide[questionNumber].options.push("");
        this.setState({ questionsToDecide: this.state.questionsToDecide });
    }
    removeVoteOptionFromQuestion(questionNumber, optionNumber) {
        let targetQuestion = this.state.questionsToDecide[questionNumber];
        if (targetQuestion.options.length > 2) {
            targetQuestion.options.splice(optionNumber, 1);
            this.setState({ questionsToDecide: this.state.questionsToDecide });
        }
    }
    onChangeQuestion(questionNumber, event) {
        this.state.questionsToDecide[questionNumber].text = event.target.value;
        this.setState({ questionsToDecide: this.state.questionsToDecide });
    }
    onChangeOption(questionNumber, optionNumber, event) {
        this.state.questionsToDecide[questionNumber].options[optionNumber] = event.target.value;
        this.setState({ questionsToDecide: this.state.questionsToDecide });
    }
    onAddVoter() {
        this.state.voterList.push({ name: "", remainingVoteBudget: 0, votes: [] });
        this.setState({ voterList: this.state.voterList });
    }
    onRemoveVoter(voterNumber) {
        let tempVoters = this.state.voterList;
        if (tempVoters.length >= 2) {
            tempVoters.splice(voterNumber, 1);
            this.setState({ voterList: tempVoters });
        }
    }
    onChangeVoter(voterNumber, event) {
        this.state.voterList[voterNumber] = event.target.value;
        this.setState({ voterList: this.state.voterList });
    }
    onEditVoteTotal(event) {
        this.setState({ voteBudget: event.target.value });
    }
    startVote() {
        let newVoterList = this.state.voterList.map((voter) => {
            return { name: voter.name,
                remainingVoteBudget: this.state.voteBudget,
                votes: this.state.questionsToDecide.map((question) => {
                    return new Array(question.options.length).fill(0);
                })
            };
        });
        this.setState({ currentVoterNumber: 0, voterList: newVoterList, voteState: "VoterSelection" });
    }
    onChangeVote(voterNumber, questionNumber, optionNumber, event) {
        let input = Number(event.target.value);
        const targetVoter = this.state.voterList[voterNumber];
        if (input >= 0) {
            targetVoter.votes[questionNumber][optionNumber] = input;
        }
        else {
            targetVoter.votes[questionNumber][optionNumber] = 0;
        }
        let tokensSpent = this.getTotalVoteTokensSpent(voterNumber);
        targetVoter.remainingVoteBudget = this.state.voteBudget - tokensSpent;
        this.setState({ voterList: this.state.voterList });
    }
    getTotalVoteTokensSpent(voterNumber) {
        return this.state.voterList[voterNumber].votes.reduce((total, current) => { return current.reduce(sum, 0) + total; }, 0);
    }
    countUpTheVote() {
        let voteFinished = false;
        if (!this.state.voterList.every((voter) => { return voter.remainingVoteBudget === 0; })) {
            voteFinished = confirm("Some voters have unspent vote tokens; Are you sure you want to close the vote?");
        }
        if (voteFinished) {
            this.setState({ voteState: "VoteCount" });
        }
    }
    calculateTotalVotes() {
        let voteTotals = [];
        for (let questionNumber = 0; questionNumber < this.state.questionsToDecide.length; questionNumber++) {
            voteTotals.push([]);
            for (let optionNumber = 0; optionNumber < this.state.questionsToDecide[questionNumber].options.length; optionNumber++) {
                voteTotals[questionNumber].push(0);
                for (const voter of this.state.voterList) {
                    voteTotals[questionNumber][optionNumber] += voteTokensToVotes(voter.votes[questionNumber][optionNumber]);
                }
            }
        }
        return voteTotals;
    }
    resetVote() {
        this.setState({ voteState: "Setup" });
    }
    getVoterButtonColor(voterNumber) {
        let currentVoter = this.state.voterList[voterNumber];
        if (currentVoter.remainingVoteBudget > 0) {
            return yellowColor;
        }
        else if (currentVoter.remainingVoteBudget === 0) {
            return greenColor;
        }
        else if (currentVoter.remainingVoteBudget < 0) {
            return redColor;
        }
    }
    returnToVoterSelection() {
        this.setState({ voteState: "VoterSelection" });
    }
    showVoterBallot(voterNumber) {
        this.setState({ currentVoterNumber: voterNumber, voteState: "Vote" });
    }
    render() {
        if (this.state.voteState === "Setup") {
            return (React.createElement("div", null,
                React.createElement(QuestionList, { questions: this.state.questionsToDecide, onAddQuestion: () => { this.addVoteQuestion(); }, onRemoveQuestion: (i) => { this.removeVoteQuestion(i); }, onAddOption: (i) => { this.addVoteOptionToQuestion(i); }, onRemoveOption: (quest, opt) => { this.removeVoteOptionFromQuestion(quest, opt); }, onChangeQuestion: (quest, e) => { this.onChangeQuestion(quest, e); }, onChangeOption: (quest, opt, e) => { this.onChangeOption(quest, opt, e); } }),
                React.createElement(VoterList, { voterNameList: this.state.voterList.map((voter) => { return voter.name; }), onAddVoter: () => { this.onAddVoter(); }, onRemoveVoter: (voter) => { this.onRemoveVoter(voter); }, onChangeVoter: (voter, e) => { this.onChangeVoter(voter, e); } }),
                React.createElement(VotingBudget, { voteBudget: this.state.voteBudget, onChange: (e) => { this.onEditVoteTotal(e); } }),
                React.createElement("button", { onClick: () => { this.startVote(); } }, "Start the vote")));
        }
        else if (this.state.voteState === "VoterSelection") {
            return (React.createElement("div", null,
                React.createElement("ol", null, this.state.voterList.map((voter, counter) => {
                    return (React.createElement("li", null,
                        React.createElement("button", { onClick: () => this.showVoterBallot(counter), style: { "backgroundColor": this.getVoterButtonColor(counter) } }, voter.name)));
                })),
                React.createElement("button", { onClick: () => { this.countUpTheVote(); } }, "Count the votes")));
        }
        else if (this.state.voteState === "Vote") {
            let currentVoter = this.state.voterList[this.state.currentVoterNumber];
            return (React.createElement("div", null,
                React.createElement("p", null,
                    "Currently voting ",
                    currentVoter.name,
                    ". Vote budget left: ",
                    currentVoter.remainingVoteBudget),
                React.createElement(Ballot, { questions: this.state.questionsToDecide, onChangeVote: (quest, opt, e) => { this.onChangeVote(this.state.currentVoterNumber, quest, opt, e); }, votes: currentVoter.votes }),
                React.createElement("button", { onClick: () => { this.returnToVoterSelection(); }, style: { "backgroundColor": this.getVoterButtonColor(this.state.currentVoterNumber) } }, "Submit the vote")));
        }
        else {
            const voteTotals = this.calculateTotalVotes();
            return (React.createElement("div", null,
                React.createElement("p", null, "Vote concluded. Final vote counts:"),
                React.createElement(VoteResults, { questions: this.state.questionsToDecide, voteTotals: voteTotals }),
                React.createElement("button", { onClick: () => { this.resetVote(); } }, "Start over?")));
        }
        ;
    }
}
class QuestionList extends React.Component {
    render() {
        let questionTexts = [];
        let optionLists = [];
        for (let questionNumber = 0; questionNumber < this.props.questions.length; questionNumber++) {
            const currentQuestion = this.props.questions[questionNumber];
            questionTexts.push(currentQuestion.text);
            optionLists.push(React.createElement(VariableLengthList, { contentList: currentQuestion.options, onChange: (optionNumber, e) => { this.props.onChangeOption(questionNumber, optionNumber, e); }, onRemove: (optionNumber) => { this.props.onRemoveOption(questionNumber, optionNumber); }, onAdd: () => { this.props.onAddOption(questionNumber); }, inputType: "text" }));
        }
        return (React.createElement("div", null,
            React.createElement("div", null, "List of questions that will be voted on."),
            React.createElement(VariableLengthList, { contentList: questionTexts, onChange: this.props.onChangeQuestion, onRemove: this.props.onRemoveQuestion, onAdd: this.props.onAddQuestion, subLists: optionLists, inputType: "text" })));
    }
}
class VoterList extends React.Component {
    render() {
        return (React.createElement("div", null,
            React.createElement("div", null, "List of voters."),
            React.createElement(VariableLengthList, { contentList: this.props.voterNameList, onChange: this.props.onChangeVoter, onRemove: this.props.onRemoveVoter, onAdd: this.props.onAddVoter, inputType: "text" })));
    }
}
class Ballot extends React.Component {
    render() {
        return (React.createElement("div", null,
            React.createElement("div", null, "Please type in your allocated vote tokens in the appropriate boxes."),
            this.props.questions.map((question, Counter) => {
                return React.createElement("div", null,
                    React.createElement("p", null, question.text),
                    React.createElement(VariableLengthList, { contentList: this.props.votes[Counter], labels: question.options.map((optionText, i) => {
                            return optionText + "; Votes purchased: " + String(voteTokensToVotes(this.props.votes[Counter][i])) + " ";
                        }), onChange: (optionNumber, e) => { this.props.onChangeVote(Counter, optionNumber, e); }, inputType: "number" }));
            })));
    }
}
class VoteResults extends React.Component {
    render() {
        return (React.createElement("div", null, this.props.questions.map((question, Counter) => {
            return React.createElement("div", null,
                React.createElement("p", null, question.text),
                React.createElement("ol", null, question.options.map((option, optionNumber) => {
                    let uniqueVoteCounts = getOccurenceCountsInArray(this.props.voteTotals[Counter]);
                    let maxVoteValue = Math.max(...this.props.voteTotals[Counter]);
                    let winnerColor = greenColor;
                    if (uniqueVoteCounts.get(maxVoteValue) != 1) { // more than 1 winner
                        winnerColor = yellowColor;
                    }
                    if (this.props.voteTotals[Counter][optionNumber] === maxVoteValue) {
                        return React.createElement("li", { style: { "backgroundColor": winnerColor } }, option + "; Votes: " + String(this.props.voteTotals[Counter][optionNumber]));
                    }
                    else {
                        return React.createElement("li", null, option + "; Votes: " + String(this.props.voteTotals[Counter][optionNumber]));
                    }
                })));
        })));
    }
}
class VariableLengthList extends React.Component {
    render() {
        return (React.createElement("div", null,
            React.createElement("ol", null, this.props.contentList.map((value, Counter) => {
                return React.createElement("li", { key: Counter },
                    React.createElement(TextForm, { formValue: value, label: this.props.labels ? this.props.labels[Counter] : null, onChange: (e) => this.props.onChange(Counter, e), onRemove: this.props.onRemove ? () => { this.props.onRemove(Counter); } : null, inputType: this.props.inputType }),
                    this.props.subLists ? this.props.subLists[Counter] : null);
            })),
            this.props.onAdd ? React.createElement("button", { onClick: this.props.onAdd }, "+") : null));
    }
}
class TextForm extends React.Component {
    render() {
        return (React.createElement("div", null,
            this.props.label ? this.props.label : null,
            React.createElement("label", null,
                React.createElement("input", { type: this.props.inputType ? this.props.inputType : "text", value: this.props.formValue, onChange: this.props.onChange, size: this.props.formValue.length }),
                this.props.onRemove ? React.createElement("button", { onClick: this.props.onRemove }, "X") : null)));
    }
}
class VotingBudget extends React.Component {
    render() {
        return (React.createElement(TextForm, { label: "Vote budget:", formValue: this.props.voteBudget, onChange: this.props.onChange, inputType: "number" }));
    }
}
ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
//# sourceMappingURL=VotingCode.js.map