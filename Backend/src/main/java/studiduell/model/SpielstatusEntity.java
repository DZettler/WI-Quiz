package studiduell.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

@Entity
@Table(name = "Spielstatus") //TODO capital letter for all entity-table mappings
public class SpielstatusEntity {
	@Id
	@JoinColumn(name = "name", unique = true, nullable = false)
	private char name;

	public SpielstatusEntity() {
	}

	public SpielstatusEntity(char name) {
		this.name = name;
	}

	public char getName() {
		return name;
	}

	public void setName(char name) {
		this.name = name;
	}
	
	@Transient
	@OneToOne(mappedBy = "spielstatus_name")
	private SpielEntity spielEntity;
}