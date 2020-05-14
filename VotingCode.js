'use strict';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { questionsToDecide: [{text: "", options: ["",""]}],
                   voters: [],
                   voteBudget: 100 };
  }

  addVoteQuestion() {
    this.state.questionsToDecide.push({ text: "", options: ["",""]})
    this.setState({questionsToDecide: this.state.questionsToDecide});
  }

  removeVoteQuestion(questionNumber) {
    if ((questionNumber >= 0) && (questionNumber < this.state.questionsToDecide.length)) {
      var tempQuestions = this.state.questionsToDecide
      tempQuestions.splice(questionNumber, 1 );
      this.setState({questionsToDecide: tempQuestions});
    }
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

  onEditVoteTotal(event) {
    this.setState({voteBudget: event.target.value});
  }

  submitVote() {

  }

  render() {
    return (<div>
      <QuestionList questions = {this.state.questionsToDecide} 
                    onAddQuestion = {() => this.addVoteQuestion()}
                    onRemoveQuestion = {(i) => this.removeVoteQuestion(i)}
                    onAddOption = {(i) => this.addVoteOptionToQuestion(i)}
                    onRemoveOption = {(i, j) => this.removeVoteOptionFromQuestion(i, j)}
                    onChangeQuestion = {(i, e) => this.onChangeQuestion(i, e)}
                    onChangeOption = {(i, j, e) => this.onChangeOption(i, j, e)}/>
      <VoterList voters = {this.state.voters}/>
      <VotingBudget voteBudget = {this.state.voteBudget} onEdit = {(e) => this.onEditVoteTotal(e)}/>
    </div>); 
  }
}

class QuestionList extends React.Component {
  render() {
    let votedQuestions = this.props.questions.map((question, questionNumber) => { return (
        <li key={questionNumber}>
          <TextForm formText = {question.text} 
                    onChange = {(e) => this.props.onChangeQuestion(questionNumber, e)} 
                    onRemove = {() => this.props.onRemoveQuestion(questionNumber)}/>
          <ol>
            {question.options.map((option, optionNumber) => {
                return <li key = {optionNumber}>
                  <TextForm formText = {option} 
                            onChange = {(e) => this.props.onChangeOption(questionNumber, optionNumber, e)}
                            onRemove = {() => this.props.onRemoveOption(questionNumber, optionNumber)}/></li>
            })}
          </ol>
          <button onClick={() => {this.props.onAddOption(questionNumber)}}>Add another vote option</button>
        </li>)});
    return (<div>
              <div>List of questions that will be voted on.</div>
                <ol>
                  {votedQuestions}
                </ol>
              <button onClick = {this.props.onAddQuestion}> Add another question </button>
            </div>);
  }
}

class TextForm extends React.Component {
  render() {
    return ( <div>
              {this.props.label ? this.props.label : null}
              <label>
                <input type="text" value={this.props.formText} onChange={this.props.onChange} />      
                {this.props.onRemove ? <button onClick = {this.props.onRemove}>X</button> : null}  
              </label>
            </div>);
  }
}


class VoterList extends React.Component {
  render() {
    return null;
  }
}

class VotingBudget extends React.Component {
  render() {
    return (<div><TextForm label = "Vote budget:" text = {this.props.voteBudget} onEdit = {this.props.onEdit}/></div>);
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);