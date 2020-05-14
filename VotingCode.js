'use strict';

let sum = (total, current) => {return Number(total) + Number(current)};

function voteTokensToVotes(voteTokens) {
  return Math.floor(Math.sqrt(voteTokens));
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { questionsToDecide: [{text: "Abra", options: ["Kadanbra","Alakazam"]}, {text: "Pichu", options: ["Pickachu","Raichu"]}],
                   voterList: ["Voter 1", "Voter 2"],
                   voteBudget: 100,
                   voteState: -1 };
  }

  addVoteQuestion() {
    this.state.questionsToDecide.push({ text: "", options: ["",""]})
    this.setState({questionsToDecide: this.state.questionsToDecide});
  }

  removeVoteQuestion(questionNumber) {
    let tempQuestions = this.state.questionsToDecide
    tempQuestions.splice(questionNumber, 1 );
    this.setState({questionsToDecide: tempQuestions});
  }

  addVoteOptionToQuestion(questionNumber) {
    this.state.questionsToDecide[questionNumber].options.push("");
    this.setState({questionsToDecide: this.state.questionsToDecide});
  }

  removeVoteOptionFromQuestion(questionNumber, optionNumber) {
    let targetQuestion = this.state.questionsToDecide[questionNumber];
    if (targetQuestion.options.length > 2) {
      targetQuestion.options.splice(optionNumber, 1);
      this.setState({questionsToDecide: this.state.questionsToDecide});
    }
  }

  onChangeQuestion(questionNumber, event) {
    this.state.questionsToDecide[questionNumber].text = event.target.value;
    this.setState({questionsToDecide: this.state.questionsToDecide});
  }

  onChangeOption(questionNumber, optionNumber, event) {
    this.state.questionsToDecide[questionNumber].options[optionNumber] = event.target.value;
    this.setState({questionsToDecide: this.state.questionsToDecide});
  }

  onAddVoter() {
    this.state.voterList.push("");
    this.setState({voterList: this.state.voterList});
  }

  onRemoveVoter(voterNumber) {
    let tempVoters = this.state.voterList;
    if (tempVoters.length >= 2) {
      tempVoters.splice(voterNumber, 1 );
      this.setState({voterList: tempVoters});
    }
  }

  onChangeVoter(voterNumber, event) {
    this.state.voterList[voterNumber] = event.target.value;
    this.setState({voterList: this.state.voterList});
  }

  onEditVoteTotal(event) {
    this.setState({voteBudget: event.target.value});
  }

  startVote() {
    this.state.voterList = this.state.voterList.map((voter) => { 
      return {name: voter, 
              remainingVoteBudget: this.state.voteBudget,
              votes: this.state.questionsToDecide.map((question) => {
                let optionVotes = [];
                optionVotes.length = question.options.length;
                optionVotes.fill(0);
                return optionVotes})
      }});
    this.setState({voteState: 0, voterList: this.state.voterList});
  }

  onChangeVote( voterNumber, questionNumber, optionNumber, event) {
    let input = Number(event.target.value);
    const targetVoter = this.state.voterList[voterNumber];
    if ( input >= 0) {
      targetVoter.votes[questionNumber][optionNumber] = input;
    } else {
      targetVoter.votes[questionNumber][optionNumber] = 0;
    }
    let tokensSpent = this.getTotalVoteTokensSpent(voterNumber);
    targetVoter.remainingVoteBudget = this.state.voteBudget - tokensSpent;
    this.setState({voterList: this.state.voterList});
  }

  getTotalVoteTokensSpent(voterNumber) {
    return this.state.voterList[voterNumber].votes.reduce((total, current) => {return current.reduce(sum, 0) + total;} , 0);
  }

  giveBallotToNextVoter() {
    if ( this.getTotalVoteTokensSpent(this.state.voteState) > this.state.voteBudget) {
      window.alert("Too many tokens spent! Spend less.");
    } else {
      this.state.voteState++;
      this.setState({voteState: this.state.voteState});
    }
  }

  calculateTotalVotes() {
    let voteTotals = [];
    for (let questionNumber = 0; questionNumber < this.state.questionsToDecide.length; questionNumber++){
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
    this.state.voterList = this.state.voterList.map((voter) => {return voter.name}); 
    this.setState({voteState: -1, voterList: this.state.voterList});
  }

  render() {
    if (this.state.voteState === -1) {
      return (<div>
        <QuestionList questions = {this.state.questionsToDecide} 
                      onAddQuestion = {() => {this.addVoteQuestion()}}
                      onRemoveQuestion = {(i) => {this.removeVoteQuestion(i)}}
                      onAddOption = {(i) => {this.addVoteOptionToQuestion(i)}}
                      onRemoveOption = {(quest, opt) => {this.removeVoteOptionFromQuestion(quest, opt)}}
                      onChangeQuestion = {(quest, e) => {this.onChangeQuestion(quest, e)}}
                      onChangeOption = {(quest, opt, e) => {this.onChangeOption(quest, opt, e)}}/>
        <VoterList voterList = {this.state.voterList}
                  onAddVoter = {() => {this.onAddVoter()}}
                  onRemoveVoter = {(voter) => {this.onRemoveVoter(voter)}}
                  onChangeVoter = {(voter, e) => {this.onChangeVoter(voter, e)}}/>
        <VotingBudget voteBudget = {this.state.voteBudget} onChange = {(e) => {this.onEditVoteTotal(e)}}/>
        <button onClick={() => {this.startVote()}}>Start the vote</button>
      </div>);
    } else if (this.state.voteState < this.state.voterList.length) {
      let currentVoter = this.state.voterList[this.state.voteState];
      return (<div>
        <p>Currently voting {currentVoter.name}. Vote budget left: {currentVoter.remainingVoteBudget}</p>
        <Ballot questions = {this.state.questionsToDecide} 
                onChangeVote = {(quest, opt, e) => {this.onChangeVote(this.state.voteState, quest, opt, e)}}
                votes = {currentVoter.votes}/>
        <button onClick={() => {this.giveBallotToNextVoter()}}>Submit the vote</button>
      </div>);
    } else {
      const voteTotals = this.calculateTotalVotes();
      return (<div>
        <p>Vote concluded. Final vote counts:</p>
        <VoteResults questions = {this.state.questionsToDecide} voteTotals = {voteTotals}/>
        <button onClick={() => {this.resetVote()}}>Start over?</button>
      </div>);
    };
  }
}

class QuestionList extends React.Component {
  render() {
    let questionTexts = [];
    let optionLists = [];
    for (let questionNumber = 0; questionNumber < this.props.questions.length; questionNumber++) {
      const currentQuestion = this.props.questions[questionNumber];
      questionTexts.push(currentQuestion.text);
      optionLists.push(<VariableLengthList contentList = {currentQuestion.options} 
                                onChange = {(optionNumber, e) => {this.props.onChangeOption(questionNumber, optionNumber, e)}}
                                onRemove = {(optionNumber) => {this.props.onRemoveOption(questionNumber, optionNumber)}}
                                onAdd = {() => {this.props.onAddOption(questionNumber)}}/>);
    }
    return ( <div>
                <div>List of questions that will be voted on.</div>
                <VariableLengthList contentList = {questionTexts} 
                    onChange = {this.props.onChangeQuestion}
                    onRemove = {this.props.onRemoveQuestion}
                    onAdd = {this.props.onAddQuestion}
                    subLists = {optionLists}/> 
            </div>);
  }
}


class VoterList extends React.Component {
  render() {
    return ( <div>
                <div>List of voters.</div>
                <VariableLengthList contentList = {this.props.voterList} 
                    onChange = {this.props.onChangeVoter}
                    onRemove = {this.props.onRemoveVoter}
                    onAdd = {this.props.onAddVoter}/> 
            </div>);
  }
}


class Ballot extends React.Component {
  render() {
    return ( <div>
            <div>Please type in your allocated vote tokens in the appropriate boxes.</div>
            {this.props.questions.map((question, Counter) => {
              return <div>
                <p>{question.text}</p>
                <VariableLengthList contentList = {this.props.votes[Counter]}
                                    labels = {question.options.map((optionText, i) => {
                                      return optionText + "; Votes purchased: " + String(voteTokensToVotes(this.props.votes[Counter][i])) + " ";
                                    })} 
                                    onChange = {(optionNumber, e) => {this.props.onChangeVote(Counter, optionNumber, e)}}
                                    inputType = "number"
                                    />
            </div>})}
        </div>);
  }
}


class VoteResults extends React.Component {
  render() {
    return ( <div>
            {this.props.questions.map((question, Counter) => {
              return <div>
                <p>{question.text}</p>
                <ol>
                  {question.options.map((option, optionNumber) => {
                    return <li>{option + "; Votes: " + String(this.props.voteTotals[Counter][optionNumber])}</li>;
                  })}
                </ol>
            </div>})}
        </div>);
  }
}


class VariableLengthList extends React.Component {
  render () {
    return (
      <div>
        <ol>
          {this.props.contentList.map((text, Counter) => {
              return <li key = {Counter}>
                      <TextForm formText = {text} 
                                label = {this.props.labels ? this.props.labels[Counter] : null}
                                onChange = {(e) => this.props.onChange(Counter, e)}
                                onRemove = {this.props.onRemove ? () => {this.props.onRemove(Counter)} : null}
                                inputType = {this.props.inputType}/>
                      {this.props.subLists ? this.props.subLists[Counter] : null}
                    </li>
          })}
        </ol>
        {this.props.onAdd ? <button onClick={this.props.onAdd}>+</button> : null}
      </div>);
  }
}


class TextForm extends React.Component {
  render() {
    return ( <div>
              {this.props.label ? this.props.label : null}
              <label>
                <input type = {this.props.inputType ? this.props.inputType : "text"} 
                        value={this.props.formText} 
                        onChange={this.props.onChange} />      
                {this.props.onRemove ? <button onClick = {this.props.onRemove}>X</button> : null}  
              </label>
            </div>);
  }
}

class VotingBudget extends React.Component {
  render() {
    return (<TextForm label = "Vote budget:" formText = {this.props.voteBudget} onChange = {this.props.onChange} type = "number"/>);
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);